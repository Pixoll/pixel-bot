"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
class PingCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'info',
            description: 'Pong! 🏓',
            guarded: true,
        }, {});
    }
    async run(context) {
        const now = Date.now();
        const isMessage = context instanceof pixoll_commando_1.CommandoMessage;
        const pingMsg = isMessage ? await context.replyEmbed((0, functions_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Pinging...',
        })) : null;
        const roundtrip = Math.abs(pingMsg
            ? (pingMsg.createdTimestamp - context.createdTimestamp)
            : (context.createdTimestamp - now));
        const heartbeat = Math.round(this.client.ws.ping || 0);
        const type = isMessage ? 'Messages' : 'Interactions';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setTitle('🏓 Pong!')
            .setDescription((0, common_tags_1.stripIndent) `
                **${type} ping:** ${roundtrip}ms
                **API ping:** ${heartbeat}ms
            `);
        if (!isMessage)
            await (0, functions_1.replyAll)(context, embed);
        await pingMsg?.edit({ embeds: [embed] }).catch(() => null);
    }
}
exports.default = PingCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL3BpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQW1EO0FBQ25ELHFEQUEyRjtBQUMzRixxREFBNkQ7QUFFN0QsTUFBcUIsV0FBWSxTQUFRLHlCQUFPO0lBQzVDLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLFVBQVU7WUFDdkIsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixNQUFNLFNBQVMsR0FBRyxPQUFPLFlBQVksaUNBQWUsQ0FBQztRQUNyRCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFBLHNCQUFVLEVBQUM7WUFDNUQsS0FBSyxFQUFFLE1BQU07WUFDYixLQUFLLEVBQUUsU0FBUztZQUNoQixXQUFXLEVBQUUsWUFBWTtTQUM1QixDQUFDLENBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU87WUFDOUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLENBQ3JDLENBQUM7UUFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUV2RCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQ3JELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFFBQVEsQ0FBQyxVQUFVLENBQUM7YUFDcEIsY0FBYyxDQUFDLElBQUEseUJBQVcsRUFBQTtvQkFDbkIsSUFBSSxZQUFZLFNBQVM7Z0NBQ2IsU0FBUzthQUM1QixDQUFDLENBQUM7UUFFUCxJQUFJLENBQUMsU0FBUztZQUFFLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQyxNQUFNLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FDSjtBQXJDRCw4QkFxQ0MifQ==