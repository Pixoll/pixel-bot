"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
class VoteCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'misc',
            description: 'Vote for the bot and make it grow!',
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setEmoji('👍')
            .setLabel('Vote me')
            .setURL('https://top.gg/bot/802267523058761759/vote'));
        await (0, functions_1.replyAll)(context, {
            content: 'Vote for the bot with the button below!',
            components: [row],
        });
    }
}
exports.default = VoteCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9taXNjL3ZvdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFDMUUsMkNBQTBFO0FBQzFFLHFEQUFpRDtBQUVqRCxNQUFxQixXQUFZLFNBQVEseUJBQU87SUFDNUMsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUI7UUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSw2QkFBZ0IsRUFBaUI7YUFDNUMsYUFBYSxDQUFDLElBQUksMEJBQWEsRUFBRTthQUM3QixRQUFRLENBQUMsd0JBQVcsQ0FBQyxJQUFJLENBQUM7YUFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQzthQUNkLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsTUFBTSxDQUFDLDRDQUE0QyxDQUFDLENBQ3hELENBQUM7UUFFTixNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUU7WUFDcEIsT0FBTyxFQUFFLHlDQUF5QztZQUNsRCxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDcEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBeEJELDhCQXdCQyJ9