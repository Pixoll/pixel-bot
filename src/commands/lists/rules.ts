import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments, RuleSchema } from 'pixoll-commando';
import { generateEmbed, basicEmbed, confirmButtons, replyAll } from '../../utils/functions';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'clear'],
    default: 'view',
    parse(value: string): string {
        return value.toLowerCase();
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class RulesCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'rules',
            group: 'lists',
            description: 'Displays all the rules of this server. Use the `rule` command to add rules.',
            guildOnly: true,
            format: stripIndent`
                rules <view> - Display the server rules.
                rules clear - Delete all of the server rules (server owner only).
            `,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'Display the server rules.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'clear',
                description: 'Delete all of the server rules (server owner only).',
            }],
        });
    }

    public async run(context: CommandContext<true>, { subCommand }: ParsedArgs): Promise<void> {
        const { guild } = context;
        const data = await guild.database.rules.fetch();

        if (!data || data.rules.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server. Use the `rule` command to add rules.',
            }));
            return;
        }

        switch (subCommand) {
            case 'view':
                return await this.runView(context, data.rules);
            case 'clear':
                return await this.runClear(context, data);
        }
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandContext<true>, rulesList: string[]): Promise<void> {
        const { guild } = context;

        await generateEmbed(context, rulesList, {
            number: 5,
            authorName: `${guild.name}'s rules`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            title: 'Rule',
            hasObjects: false,
        });
    }

    /**
     * The `clear` sub-command
     */
    protected async runClear(context: CommandContext<true>, data: RuleSchema): Promise<void> {
        const { client, guild, author } = context;

        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            await this.onBlock(context, 'guildOwnerOnly');
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'delete all of the server rules',
        });
        if (!confirmed) return;

        await guild.database.rules.delete(data);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'All the server rules have been deleted.',
        }));
    }
}
