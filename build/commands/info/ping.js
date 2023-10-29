"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
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
        const replyToEdit = isMessage ? await context.reply(`${(0, utils_1.customEmoji)('loading')} Pinging...`) : null;
        const roundtrip = Math.abs(replyToEdit
            ? (replyToEdit.createdTimestamp - context.createdTimestamp)
            : (context.createdTimestamp - now));
        const heartbeat = Math.round(this.client.ws.ping || 0);
        const type = isMessage ? 'Messages' : 'Interactions';
        await (0, utils_1.reply)(context, (0, common_tags_1.stripIndent) `
            🏓 **Pong!**
            **${type} ping:** ${roundtrip}ms
            **API ping:** ${heartbeat}ms
        `);
    }
}
exports.default = PingCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL3BpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMscURBQTBFO0FBQzFFLHVDQUFpRDtBQUVqRCxNQUFxQixXQUFZLFNBQVEseUJBQU87SUFDNUMsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsVUFBVTtZQUN2QixPQUFPLEVBQUUsSUFBSTtZQUNiLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUI7UUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUEsbUJBQVcsRUFBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUVuRyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVc7WUFDbEMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLENBQ3JDLENBQUM7UUFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUV2RCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQ3JELE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEseUJBQVcsRUFBQTs7Z0JBRXhCLElBQUksWUFBWSxTQUFTOzRCQUNiLFNBQVM7U0FDNUIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBN0JELDhCQTZCQyJ9