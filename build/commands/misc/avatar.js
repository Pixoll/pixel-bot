"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to get their avatar from?',
        type: 'user',
        required: false,
    }];
class AvatarCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['av'],
            group: 'misc',
            description: 'Displays a user\'s avatar, or yours if you don\'t specify any.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'avatar <user>',
            examples: ['avatar Pixoll'],
            args,
            autogenerateSlashCommand: true,
            contextMenuCommandTypes: [discord_js_1.ApplicationCommandType.User],
        });
    }
    async run(context, { user: passedUser }) {
        const user = passedUser ?? context.author;
        await (0, utils_1.reply)(context, mapAvatarData(user));
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await (0, utils_1.reply)(interaction, mapAvatarData(interaction.targetUser));
    }
}
exports.default = AvatarCommand;
function mapAvatarData(user) {
    let avatarUrl = user.displayAvatarURL({ forceStatic: false, size: 2048 });
    if (/\.webp/.test(avatarUrl)) {
        avatarUrl = user.displayAvatarURL({ extension: 'png', size: 2048 });
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(utils_1.pixelColor)
        .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ forceStatic: false }),
    })
        .setImage(avatarUrl)
        .setTimestamp();
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setLabel('Download')
        .setURL(avatarUrl));
    return {
        embeds: [embed],
        components: [row],
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYXZhdGFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBUW9CO0FBQ3BCLHFEQU95QjtBQUN6Qix1Q0FBZ0Q7QUFFaEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsYUFBYyxTQUFRLHlCQUF5QjtJQUNoRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDZixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxnRUFBZ0U7WUFDN0UsbUJBQW1CLEVBQUUscURBQXFEO1lBQzFFLE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUMzQixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtZQUM5Qix1QkFBdUIsRUFBRSxDQUFDLG1DQUFzQixDQUFDLElBQUksQ0FBQztTQUN6RCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBYztRQUN0RSxNQUFNLElBQUksR0FBRyxVQUE2QixJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDN0QsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVlLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFzRDtRQUMzRixNQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsRCxNQUFNLElBQUEsYUFBSyxFQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztDQUNKO0FBekJELGdDQXlCQztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVU7SUFDN0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMxRSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDMUIsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7S0FDdkU7SUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7U0FDM0IsUUFBUSxDQUFDLGtCQUFVLENBQUM7U0FDcEIsU0FBUyxDQUFDO1FBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHO1FBQ2QsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztLQUN6RCxDQUFDO1NBQ0QsUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUNuQixZQUFZLEVBQUUsQ0FBQztJQUVwQixNQUFNLEdBQUcsR0FBRyxJQUFJLDZCQUFnQixFQUFpQjtTQUM1QyxhQUFhLENBQUMsSUFBSSwwQkFBYSxFQUFFO1NBQzdCLFFBQVEsQ0FBQyx3QkFBVyxDQUFDLElBQUksQ0FBQztTQUMxQixRQUFRLENBQUMsVUFBVSxDQUFDO1NBQ3BCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FDckIsQ0FBQztJQUVOLE9BQU87UUFDSCxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZixVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUM7S0FDcEIsQ0FBQztBQUNOLENBQUMifQ==