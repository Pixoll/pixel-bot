"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to get the infractions from?',
        type: 'user',
    }];
class InfractionsCommand extends pixoll_commando_1.Command {
    constructor(client) {
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
        });
    }
    async run(context, { user }) {
        const { guild } = context;
        const db = guild.database.moderations;
        const mods = await db.fetchMany({ userId: user.id });
        if (mods.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'That user has no infractions.',
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
        await (0, utils_1.generateEmbed)(context, mods.toJSON(), {
            authorName: `${user.username} has ${(0, utils_1.pluralize)('infraction', mods.size)}`,
            authorIconURL: user.displayAvatarURL({ forceStatic: false }),
            title: ' •  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['updatedAt', 'guild', 'userId', 'userTag'],
            useDocId: true,
            components: [filterMenu],
        });
    }
}
exports.default = InfractionsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvaW5mcmFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBdUU7QUFDdkUscURBQTZGO0FBQzdGLHVDQUE2RTtBQUU3RSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsb0RBQW9EO1FBQzVELElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBVSxDQUFDO0FBS1osTUFBcUIsa0JBQW1CLFNBQVEseUJBQXNCO0lBQ2xFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsMkNBQTJDO1lBQ3hELG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsb0JBQW9CO1lBQzVCLFFBQVEsRUFBRSxDQUFDLG9CQUFvQixDQUFDO1lBQ2hDLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBYztRQUNoRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1FBRXRDLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSwrQkFBK0I7YUFDL0MsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFM0UsTUFBTSxVQUFVLEdBQUcsSUFBSSw2QkFBZ0IsRUFBMkIsQ0FBQyxhQUFhLENBQUMsSUFBSSxvQ0FBdUIsRUFBRTthQUN6RyxXQUFXLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUM7YUFDakMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7YUFDL0IsY0FBYyxDQUFDLFdBQVcsQ0FBQzthQUMzQixVQUFVLENBQUM7WUFDUixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQzNDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRTtZQUM1RCxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQ3RELEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUU7WUFDckQsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUM5QyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQzlDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUU7U0FDaEQsQ0FBQyxDQUNMLENBQUM7UUFFRixNQUFNLElBQUEscUJBQWEsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3hDLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLFFBQVEsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEUsYUFBYSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUM1RCxLQUFLLEVBQUUsU0FBUztZQUNoQixRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO1lBQzVCLFdBQVcsRUFBRSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQztZQUN4RCxRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQztTQUMzQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF6REQscUNBeURDIn0=