import { stripIndent, oneLine } from 'common-tags';
import { ApplicationCommandOptionType, EmbedBuilder, ApplicationCommandOptionChoiceData as ChoiceData } from 'discord.js';
import { capitalize } from 'lodash';
import {
    Command,
    CommandContext,
    CommandoAutocompleteInteraction,
    CommandoClient,
    JSONIfySchema,
    ModerationSchema,
    ParseRawArguments,
} from 'pixoll-commando';
import { basicEmbed, confirmButtons, timestamp, replyAll } from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'delete'],
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'modLogId',
    label: 'mod-log ID',
    prompt: 'What is the ID of the mod log you want to view?',
    type: 'string',
    max: 16,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ModLogCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'mod-log',
            aliases: ['modlog'],
            group: 'mod-logs',
            description: 'Display or delete a single moderation log.',
            details: oneLine`
                \`modlog ID\` has to be a valid mod log ID.
                To see all the mod logs in this server use the \`mod-logs\` command.
            `,
            format: stripIndent`
                mod-log view [mod-log ID] - Display a mod log's information.
                mod-log delete [mod-log ID] - Delete a mod log (admins only).
            `,
            examples: [
                'mod-log view 123456abcdef',
                'mod-log delete 186b2a4d2590270f',
            ],
            modPermissions: true,
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'Display a mod log\'s information.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'mod-log-id',
                    description: 'The ID of the mod log to display.',
                    required: true,
                    autocomplete: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'delete',
                description: 'Delete a mod log.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'mod-log-id',
                    description: 'The ID of the mod log to delete.',
                    required: true,
                    autocomplete: true,
                }],
            }],
        });
    }

    public async run(context: CommandContext<true>, { subCommand, modLogId }: ParsedArgs): Promise<void> {
        const { guild } = context;
        const modLog = await guild.database.moderations.fetch(modLogId);
        if (!modLog) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'I could not find the mod-log you were looking for.',
            }));
            return;
        }

        switch (subCommand) {
            case 'view':
                return await this.runView(context, modLog);
            case 'delete':
                return await this.runDelete(context, modLog);
        }
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandContext<true>, modLog: JSONIfySchema<ModerationSchema>): Promise<void> {
        const { users } = this.client;

        const user = await users.fetch(modLog.userId).catch(() => null);
        const moderator = await users.fetch(modLog.modId).catch(() => null);

        const modLogInfo = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `Mod log ${modLog._id}`, iconURL: user?.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(stripIndent`
                **Type:** ${capitalize(modLog.type)}
                **User:** ${`${user?.toString()} ${user?.tag}` || 'Unable to fetch user.'}
                **Moderator:** ${`${moderator?.toString()} ${moderator?.tag}` || 'Unable to fetch user.'}
                **Reason:** ${modLog.reason}
                **Duration:** ${modLog.duration ?? 'Permanent'}
                **Date:** ${timestamp(modLog.createdAt, 'f', true)}
            `)
            .setTimestamp();

        await replyAll(context, modLogInfo);
    }

    /**
     * The `delete` sub-command
     */
    protected async runDelete(context: CommandContext<true>, modLog: JSONIfySchema<ModerationSchema>): Promise<void> {
        const { client, member, author, guild } = context;
        if (!client.isOwner(author) || member?.permissions.has('Administrator')) {
            await this.onBlock(context, 'userPermissions', { missing: ['Administrator'] });
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'delete mod log',
            target: modLog._id,
            ...modLog,
        });
        if (!confirmed) return;

        const activeDB = guild.database.active;
        const activeLog = await activeDB.fetch(`\`${modLog._id}\``);

        if (activeLog) await activeDB.delete(activeLog);
        await guild.database.moderations.delete(modLog);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Deleted mod log with ID \`${modLog._id}\``,
        }));
    }

    public async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { guild, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const documents = await guild?.database.moderations.fetchMany();
        const choices = documents
            ?.map<ChoiceData<string>>(doc => ({
                name: `[${capitalize(doc.type)}] ${doc._id} (${doc.userTag})`,
                value: doc._id,
            }))
            .filter(doc => doc.name.toLowerCase().includes(query))
            .slice(0, 25) ?? [];
        await interaction.respond(choices);
    }
}
