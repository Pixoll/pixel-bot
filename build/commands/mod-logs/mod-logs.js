"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What moderator do you want to get the mod logs from?',
        type: 'user',
        required: false,
    }];
class ModLogsCommand extends pixoll_commando_1.Command {
    constructor(client) {
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
            contextMenuCommandTypes: [discord_js_1.ApplicationCommandType.User],
        });
    }
    async run(context, { user }) {
        await runCommand(context, user);
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await runCommand(interaction, interaction.targetUser);
    }
}
exports.default = ModLogsCommand;
async function runCommand(context, user) {
    const { guild } = context;
    if (!guild)
        return;
    const db = guild.database.moderations;
    const modLogs = await db.fetchMany(user ? { modId: user.id } : {});
    if (modLogs.size === 0) {
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Blue',
            emoji: 'info',
            description: 'There are no moderation logs.',
        }));
        return;
    }
    const message = 'isMessage' in context && context.isMessage() ? context : await context.fetchReply();
    const filterMenu = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
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
    ]));
    const avatarURL = user?.displayAvatarURL({ forceStatic: false }) || guild.iconURL({ forceStatic: false });
    await (0, utils_1.generateEmbed)(context, modLogs.toJSON(), {
        authorName: (0, common_tags_1.oneLine) `
            ${user ? `${user.username} has` : 'There\'s'}
            ${(0, utils_1.pluralize)('mod log', modLogs.size)}
        `,
        authorIconURL: avatarURL,
        title: ' •  ID:',
        keyTitle: { prefix: 'type' },
        keysExclude: ['updatedAt', 'guild', ...(user ? ['modId', 'modTag'] : [null])],
        useDocId: true,
        components: [filterMenu],
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLWxvZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvbW9kLWxvZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBc0M7QUFDdEMsMkNBQXFHO0FBQ3JHLHFEQU15QjtBQUN6Qix1Q0FBMEU7QUFFMUUsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLHNEQUFzRDtRQUM5RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGNBQWUsU0FBUSx5QkFBc0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsZ0dBQWdHO1lBQzdHLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLFFBQVEsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQzdCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsdUJBQXVCLEVBQUUsQ0FBQyxtQ0FBc0IsQ0FBQyxJQUFJLENBQUM7U0FDekQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBYztRQUNoRSxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFzRDtRQUNsRixNQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENB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