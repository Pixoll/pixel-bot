"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class InviteCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            aliases: ['support'],
            group: 'info',
            description: 'Invite this bot to your server.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { botInvite, options } = this.client;
        const invite = botInvite ? new discord_js_1.ButtonBuilder()
            .setEmoji('🔗')
            .setLabel('Invite me')
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(botInvite)
            : null;
        const support = options.serverInvite ? new discord_js_1.ButtonBuilder()
            .setEmoji('🛠')
            .setLabel('Support server')
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setURL(options.serverInvite)
            : null;
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(pixoll_commando_1.Util.filterNullishItems([
            invite,
            support,
        ]));
        if (row.components.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                description: 'No links found for bot invite or support server.',
                emoji: 'cross',
            }));
            return;
        }
        await (0, utils_1.replyAll)(context, {
            content: '\u200B',
            components: [row],
        });
    }
}
exports.default = InviteCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2luZm8vaW52aXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTBFO0FBQzFFLHFEQUFnRjtBQUNoRix1Q0FBbUQ7QUFFbkQsTUFBcUIsYUFBYyxTQUFRLHlCQUFPO0lBQzlDLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxpQ0FBaUM7WUFDOUMsT0FBTyxFQUFFLElBQUk7WUFDYix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUUzQyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksMEJBQWEsRUFBRTthQUN6QyxRQUFRLENBQUMsSUFBSSxDQUFDO2FBQ2QsUUFBUSxDQUFDLFdBQVcsQ0FBQzthQUNyQixRQUFRLENBQUMsd0JBQVcsQ0FBQyxJQUFJLENBQUM7YUFDMUIsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDO1FBRVgsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSwwQkFBYSxFQUFFO2FBQ3JELFFBQVEsQ0FBQyxJQUFJLENBQUM7YUFDZCxRQUFRLENBQUMsZ0JBQWdCLENBQUM7YUFDMUIsUUFBUSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDO2FBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFWCxNQUFNLEdBQUcsR0FBRyxJQUFJLDZCQUFnQixFQUFpQjthQUM1QyxhQUFhLENBQUMsc0JBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUNuQyxNQUFNO1lBQ04sT0FBTztTQUNWLENBQUMsQ0FBQyxDQUFDO1FBRVIsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osV0FBVyxFQUFFLGtEQUFrRDtnQkFDL0QsS0FBSyxFQUFFLE9BQU87YUFDakIsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUU7WUFDcEIsT0FBTyxFQUFFLFFBQVE7WUFDakIsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWpERCxnQ0FpREMifQ==