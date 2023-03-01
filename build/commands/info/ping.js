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
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const now = Date.now();
        const isMessage = context.isMessage();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL3BpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQW1EO0FBQ25ELHFEQUEwRTtBQUMxRSxxREFBNkQ7QUFFN0QsTUFBcUIsV0FBWSxTQUFRLHlCQUFPO0lBQzVDLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLFVBQVU7WUFDdkIsT0FBTyxFQUFFLElBQUk7WUFDYix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBQSxzQkFBVSxFQUFDO1lBQzVELEtBQUssRUFBRSxNQUFNO1lBQ2IsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLFlBQVk7U0FDNUIsQ0FBQyxDQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPO1lBQzlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxDQUNyQyxDQUFDO1FBQ0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFdkQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixRQUFRLENBQUMsVUFBVSxDQUFDO2FBQ3BCLGNBQWMsQ0FBQyxJQUFBLHlCQUFXLEVBQUE7b0JBQ25CLElBQUksWUFBWSxTQUFTO2dDQUNiLFNBQVM7YUFDNUIsQ0FBQyxDQUFDO1FBRVAsSUFBSSxDQUFDLFNBQVM7WUFBRSxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0MsTUFBTSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0o7QUF0Q0QsOEJBc0NDIn0=