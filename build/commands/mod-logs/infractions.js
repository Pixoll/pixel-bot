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
            details: '`user` has to be a user\'s username, ID or mention.',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvaW5mcmFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBdUU7QUFDdkUscURBQTZGO0FBQzdGLHVDQUE2RTtBQUU3RSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsb0RBQW9EO1FBQzVELElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBVSxDQUFDO0FBS1osTUFBcUIsa0JBQW1CLFNBQVEseUJBQXNCO0lBQ2xFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsMkNBQTJDO1lBQ3hELE9BQU8sRUFBRSxxREFBcUQ7WUFDOUQsTUFBTSxFQUFFLG9CQUFvQjtZQUM1QixRQUFRLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztZQUNoQyxjQUFjLEVBQUUsSUFBSTtZQUNwQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDaEUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUV0QyxNQUFNLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNqQixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsK0JBQStCO2FBQy9DLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTNFLE1BQU0sVUFBVSxHQUFHLElBQUksNkJBQWdCLEVBQTJCLENBQUMsYUFBYSxDQUFDLElBQUksb0NBQXVCLEVBQUU7YUFDekcsV0FBVyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDO2FBQ2pDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2FBQy9CLGNBQWMsQ0FBQyxXQUFXLENBQUM7YUFDM0IsVUFBVSxDQUFDO1lBQ1IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUMzQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUU7WUFDNUQsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUN0RCxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3JELEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7WUFDOUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUM5QyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1NBQ2hELENBQUMsQ0FDTCxDQUFDO1FBRUYsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN4QyxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxRQUFRLElBQUEsaUJBQVMsRUFBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3hFLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDNUQsS0FBSyxFQUFFLFNBQVM7WUFDaEIsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTtZQUM1QixXQUFXLEVBQUUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUM7WUFDeEQsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUM7U0FDM0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBekRELHFDQXlEQyJ9