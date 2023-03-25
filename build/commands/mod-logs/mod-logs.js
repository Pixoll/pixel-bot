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
    const message = await (0, utils_1.getContextMessage)(context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLWxvZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvbW9kLWxvZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBc0M7QUFDdEMsMkNBQXFHO0FBQ3JHLHFEQU15QjtBQUN6Qix1Q0FBNkY7QUFFN0YsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLHNEQUFzRDtRQUM5RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGNBQWUsU0FBUSx5QkFBc0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsZ0dBQWdHO1lBQzdHLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLFFBQVEsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQzdCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsdUJBQXVCLEVBQUUsQ0FBQyxtQ0FBc0IsQ0FBQyxJQUFJLENBQUM7U0FDekQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBYztRQUNoRSxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFzRDtRQUNsRixNQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENB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