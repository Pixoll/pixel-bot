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
            details: '`user` has to be a user\'s username, ID or mention.',
            format: 'mod-logs <user>',
            examples: ['mod-logs Pixoll'],
            modPermissions: true,
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user }) {
        const { guild } = context;
        const db = guild.database.moderations;
        const modLogs = await db.fetchMany(user ? { modId: user.id } : {});
        if (modLogs.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no moderation logs.',
            }));
            return;
        }
        const message = context.isMessage() ? context : await context.fetchReply();
        const filterMenu = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`${message.id}:menu`)
            .setMaxValues(1).setMinValues(1)
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
}
exports.default = ModLogsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLWxvZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvbW9kLWxvZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBc0M7QUFDdEMsMkNBQXVFO0FBQ3ZFLHFEQUE2RjtBQUM3Rix1Q0FBNkU7QUFFN0UsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLHNEQUFzRDtRQUM5RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGNBQWUsU0FBUSx5QkFBc0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsZ0dBQWdHO1lBQzdHLE9BQU8sRUFBRSxxREFBcUQ7WUFDOUQsTUFBTSxFQUFFLGlCQUFpQjtZQUN6QixRQUFRLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUM3QixjQUFjLEVBQUUsSUFBSTtZQUNwQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDaEUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUV0QyxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENB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