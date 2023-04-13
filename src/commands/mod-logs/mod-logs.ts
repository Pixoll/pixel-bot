import { oneLine } from 'common-tags';
import { ActionRowBuilder, ApplicationCommandType, StringSelectMenuBuilder, User } from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    CommandoUser,
    CommandoUserContextMenuCommandInteraction,
    ParseRawArguments,
} from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, reply, getContextMessage } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What moderator do you want to get the mod logs from?',
    type: 'user',
    required: false,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ModLogsCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'mod-logs',
            aliases: ['modlogs'],
            group: 'mod-logs',
            description: 'Displays all moderator logs of the server of a specific moderator, or all if none is specified',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'mod-logs <user>',
            examples: ['mod-logs Pixoll'],
            modPermissions: true,
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
            contextMenuCommandTypes: [ApplicationCommandType.User],
        });
    }

    public async run(context: CommandContext<true>, { user }: ParsedArgs): Promise<void> {
        await runCommand(context, user);
    }

    public async runUserContextMenu(interaction: CommandoUserContextMenuCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        await runCommand(interaction, interaction.targetUser);
    }
}

async function runCommand(
    context: CommandContext<true> | CommandoUserContextMenuCommandInteraction, user: CommandoUser | User | null
): Promise<void> {
    const { guild } = context;
    if (!guild) return;
    const db = guild.database.moderations;

    const modLogs = await db.fetchMany(user ? { modId: user.id } : {});
    if (modLogs.size === 0) {
        await reply(context, basicEmbed({
            color: 'Blue',
            emoji: 'info',
            description: 'There are no moderation logs.',
        }));
        return;
    }

    const message = await getContextMessage(context);

    const filterMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder()
        .setCustomId(`${message.id}:menu`)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder('Filter...')
        .setOptions([
            { label: 'All', value: 'all', emoji: '🎲' },
            { label: 'Bans', value: 'ban', emoji: '822644311140204554' },
            { label: 'Soft bans', value: 'soft-ban', emoji: '🔨' },
            { label: 'Temp bans', value: 'temp-ban', emoji: '⏲' },
            { label: 'Kicks', value: 'kick', emoji: '🥾' },
            { label: 'Mutes', value: 'mute', emoji: '🔇' },
            { label: 'Warns', value: 'warn', emoji: '⚠' },
        ])
    );

    const avatarURL = user?.displayAvatarURL({ forceStatic: false }) || guild.iconURL({ forceStatic: false });

    await generateEmbed(context, modLogs.toJSON(), {
        authorName: oneLine`
            ${user ? `${user.username} has` : 'There\'s'}
            ${pluralize('mod log', modLogs.size)}
        `,
        authorIconURL: avatarURL,
        title: ' •  ID:',
        keyTitle: { prefix: 'type' },
        keysExclude: ['updatedAt', 'guild', ...(user ? ['modId', 'modTag'] as const : [null])],
        useDocId: true,
        components: [filterMenu],
    });
}
