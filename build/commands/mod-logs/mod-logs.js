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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLWxvZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvbW9kLWxvZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBc0M7QUFDdEMsMkNBQXVFO0FBQ3ZFLHFEQUE2RjtBQUM3Rix1Q0FBNkU7QUFFN0UsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLHNEQUFzRDtRQUM5RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGNBQWUsU0FBUSx5QkFBc0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsZ0dBQWdHO1lBQzdHLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLFFBQVEsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQzdCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBYztRQUNoRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBRXRDLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkUsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNwQixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsK0JBQStCO2FBQy9DLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTNFLE1BQU0sVUFBVSxHQUFHLElBQUksNkJBQWdCLEVBQTJCLENBQUMsYUFBYSxDQUFDLElBQUksb0NBQXVCLEVBQUU7YUFDekcsV0FBVyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDO2FBQ2pDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2FBQy9CLGNBQWMsQ0FBQyxXQUFXLENBQUM7YUFDM0IsVUFBVSxDQUFDO1lBQ1IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUMzQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUU7WUFDNUQsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUN0RCxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3JELEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7WUFDOUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUM5QyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1NBQ2hELENBQUMsQ0FDTCxDQUFDO1FBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRTFHLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDM0MsVUFBVSxFQUFFLElBQUEscUJBQU8sRUFBQTtrQkFDYixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVO2tCQUMxQyxJQUFBLGlCQUFTLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUM7YUFDdkM7WUFDRCxhQUFhLEVBQUUsU0FBUztZQUN4QixLQUFLLEVBQUUsU0FBUztZQUNoQixRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO1lBQzVCLFdBQVcsRUFBRSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3RSxRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQztTQUMzQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUEvREQsaUNBK0RDIn0=