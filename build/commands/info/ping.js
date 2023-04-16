"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
        const replyToEdit = isMessage ? await context.replyEmbed((0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Pinging...',
        })) : null;
        const roundtrip = Math.abs(replyToEdit
            ? (replyToEdit.createdTimestamp - context.createdTimestamp)
            : (context.createdTimestamp - now));
        const heartbeat = Math.round(this.client.ws.ping || 0);
        const type = isMessage ? 'Messages' : 'Interactions';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setTitle('🏓 Pong!')
            .setDescription((0, common_tags_1.stripIndent) `
                **${type} ping:** ${roundtrip}ms
                **API ping:** ${heartbeat}ms
            `);
        await (0, utils_1.reply)(context, {
            embeds: [embed],
            replyToEdit,
        });
    }
}
exports.default = PingCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL3BpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQW1EO0FBQ25ELHFEQUEwRTtBQUMxRSx1Q0FBNEQ7QUFFNUQsTUFBcUIsV0FBWSxTQUFRLHlCQUFPO0lBQzVDLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLFVBQVU7WUFDdkIsT0FBTyxFQUFFLElBQUk7WUFDYix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBQSxrQkFBVSxFQUFDO1lBQ2hFLEtBQUssRUFBRSxNQUFNO1lBQ2IsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLFlBQVk7U0FDNUIsQ0FBQyxDQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXO1lBQ2xDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxDQUNyQyxDQUFDO1FBQ0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFdkQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLGtCQUFVLENBQUM7YUFDcEIsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUNwQixjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBO29CQUNuQixJQUFJLFlBQVksU0FBUztnQ0FDYixTQUFTO2FBQzVCLENBQUMsQ0FBQztRQUVQLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFO1lBQ2pCLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNmLFdBQVc7U0FDZCxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF4Q0QsOEJBd0NDIn0=