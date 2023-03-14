"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to get their avatar from?',
        type: 'user',
        required: false,
    }];
class BannerCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'banner',
            group: 'misc',
            description: 'Displays a user\'s banner, or yours if you don\'t specify any.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'banner <user>',
            examples: ['banner Pixoll'],
            args,
            autogenerateSlashCommand: true,
            contextMenuCommandTypes: [discord_js_1.ApplicationCommandType.User],
        });
    }
    async run(context, { user: passedUser }) {
        const user = await (passedUser ?? context.author).fetch();
        await (0, utils_1.replyAll)(context, mapBannerData(user));
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.targetUser.fetch();
        await (0, utils_1.replyAll)(interaction, mapBannerData(interaction.targetUser));
    }
}
exports.default = BannerCommand;
function mapBannerData(user) {
    let bannerUrl = user.bannerURL({ forceStatic: false, size: 2048 }) ?? null;
    if (!bannerUrl)
        return {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Blue',
                    emoji: 'info',
                    description: 'That user has no banner on their profile.',
                })],
        };
    if (/\.webp/.test(bannerUrl)) {
        bannerUrl = user.bannerURL({ extension: 'png', size: 2048 });
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#4c9f4c')
        .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ forceStatic: false }),
    })
        .setImage(bannerUrl)
        .setTimestamp();
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setLabel('Download')
        .setURL(bannerUrl));
    return {
        embeds: [embed],
        components: [row],
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYmFubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBTXlCO0FBQ3pCLDJDQVFvQjtBQUNwQix1Q0FBbUQ7QUFFbkQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsZUFBZTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDM0IsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsdUJBQXVCLEVBQUUsQ0FBQyxtQ0FBc0IsQ0FBQyxJQUFJLENBQUM7U0FDekQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQWM7UUFDdEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDMUQsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsV0FBc0Q7UUFDbEYsTUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEQsTUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBQSxnQkFBUSxFQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztDQUNKO0FBekJELGdDQXlCQztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVU7SUFDN0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQzNFLElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTztZQUNuQixNQUFNLEVBQUUsQ0FBQyxJQUFBLGtCQUFVLEVBQUM7b0JBQ2hCLEtBQUssRUFBRSxNQUFNO29CQUNiLEtBQUssRUFBRSxNQUFNO29CQUNiLFdBQVcsRUFBRSwyQ0FBMkM7aUJBQzNELENBQUMsQ0FBQztTQUNOLENBQUM7SUFFRixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDMUIsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBVyxDQUFDO0tBQzFFO0lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO1NBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUM7U0FDbkIsU0FBUyxDQUFDO1FBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHO1FBQ2QsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztLQUN6RCxDQUFDO1NBQ0QsUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUNuQixZQUFZLEVBQUUsQ0FBQztJQUVwQixNQUFNLEdBQUcsR0FBRyxJQUFJLDZCQUFnQixFQUFpQjtTQUM1QyxhQUFhLENBQUMsSUFBSSwwQkFBYSxFQUFFO1NBQzdCLFFBQVEsQ0FBQyx3QkFBVyxDQUFDLElBQUksQ0FBQztTQUMxQixRQUFRLENBQUMsVUFBVSxDQUFDO1NBQ3BCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FDckIsQ0FBQztJQUVOLE9BQU87UUFDSCxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZixVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUM7S0FDcEIsQ0FBQztBQUNOLENBQUMifQ==