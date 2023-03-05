import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    RuleSchema,
    Util,
} from 'pixoll-commando';
import { basicEmbed, replyAll, getSubCommand } from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'add', 'remove'],
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'rule',
    prompt: 'What rule do you want to add, remove or view?',
    type: ['integer', 'string'],
    min: 1,
    max: 1024,
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message);
        if (subCommand === 'add') {
            return await argument.type?.validate(value, message, Util.omit(argument, ['min']) as Argument) ?? true;
        }
        if (typeof value === 'undefined') return false;
        const integerType = message.client.registry.types.get('integer');
        const isValidInteger = await integerType?.validate(value, message, Util.omit(argument, ['max']) as Argument) ?? true;
        if (isValidInteger !== true || !message.inGuild()) return isValidInteger;
        const rulesData = await message.guild.database.rules.fetch();
        const rule = rulesData?.rules[(+value) - 1];
        if (!rule) return `That rule doesn't exist. There are only ${rulesData?.rules.length} rules in this server`;
        return true;
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
type SubCommand = ParsedArgs['subCommand'];

export default class RuleCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'rule',
            group: 'managing',
            description: 'Add or remove a rule from the server.',
            format: stripIndent`
                rule view [number] - View a single rule.
                rule add [rule] - Add a new rule (server owner only).
                rule remove [number] - Remove a rule (server owner only).
            `,
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'View a single rule.',
                options: [{
                    type: ApplicationCommandOptionType.Integer,
                    name: 'rule',
                    description: 'The number of the rule to view.',
                    required: true,
                    minValue: 1,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'add',
                description: 'Add a new rule (server owner only).',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'rule',
                    description: 'The rule you want to add.',
                    required: true,
                    maxLength: 1024,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'remove',
                description: 'Remove a rule (server owner only).',
                options: [{
                    type: ApplicationCommandOptionType.Integer,
                    name: 'rule',
                    description: 'The number of the rule to remove.',
                    required: true,
                    minValue: 1,
                }],
            }],
        });
    }

    public async run(context: CommandContext<true>, { subCommand, rule }: ParsedArgs): Promise<void> {
        const rulesData = await context.guild.database.rules.fetch();

        switch (subCommand) {
            case 'view':
                return await this.runView(context, rulesData, +rule);
            case 'add':
                return await this.runAdd(context, rulesData, rule.toString());
            case 'remove':
                return await this.runRemove(context, rulesData, +rule);
        }
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandContext<true>, rulesData: RuleSchema | null, rule: number): Promise<void> {
        if (!rulesData || rulesData.rules.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server. Add one with the `add` sub-command.',
            }));
            return;
        }

        const { guild } = context;

        const ruleEmbed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${guild.name}'s rules`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .addFields({
                name: `Rule ${rule--}`,
                value: rulesData.rules[rule],
            })
            .setTimestamp();

        await replyAll(context, ruleEmbed);
    }

    /**
     * The `add` sub-command
     */
    protected async runAdd(context: CommandContext<true>, rulesData: RuleSchema | null, rule: string): Promise<void> {
        const { guildId, guild, client, author } = context;

        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            await this.onBlock(context, 'guildOwnerOnly');
            return;
        }

        const db = guild.database.rules;
        if (rulesData) await db.update(rulesData, { $push: { rules: rule } });
        else await db.add({ guild: guildId, rules: [rule] });

        const number = rulesData ? rulesData.rules.length + 1 : 1;

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `The rule has been added under \`Rule ${number}\``,
        }));
    }

    /**
     * The `remove` sub-command
     */
    protected async runRemove(context: CommandContext<true>, rulesData: RuleSchema | null, rule: number): Promise<void> {
        if (!rulesData || rulesData.rules.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server.',
            }));
            return;
        }

        const { guild, client, author } = context;
        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            await this.onBlock(context, 'guildOwnerOnly');
            return;
        }

        rule--;
        await guild.database.rules.update(rulesData, { $pull: { rules: rulesData.rules[rule] } });
        rule++;

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Removed rule number ${rule--}:`,
            fieldValue: rulesData.rules[rule],
        }));
    }
}
