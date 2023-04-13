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
    prompt: 'What user do you want to get the infractions from?',
    type: 'user',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class InfractionsCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'infractions',
            group: 'mod-logs',
            description: 'Displays a list of infractions of a user.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'infractions [user]',
            examples: ['infractions Pixoll'],
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
    context: CommandContext<true> | CommandoUserContextMenuCommandInteraction, user: CommandoUser | User
): Promise<void> {
    const { guild } = context;
    if (!guild) return;
    const db = guild.database.moderations;

    const mods = await db.fetchMany({ userId: user.id });
    if (mods.size === 0) {
        await reply(context, basicEmbed({
            color: 'Blue',
            emoji: 'info',
            description: 'That user has no infractions.',
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

    await generateEmbed(context, mods.toJSON(), {
        authorName: `${user.username} has ${pluralize('infraction', mods.size)}`,
        authorIconURL: user.displayAvatarURL({ forceStatic: false }),
        title: ' •  ID:',
        keyTitle: { prefix: 'type' },
        keysExclude: ['updatedAt', 'guild', 'userId', 'userTag'],
        useDocId: true,
        components: [filterMenu],
    });
}
