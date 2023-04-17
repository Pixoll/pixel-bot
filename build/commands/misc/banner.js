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
        await (0, utils_1.reply)(context, mapBannerData(user));
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.targetUser.fetch();
        await (0, utils_1.reply)(interaction, mapBannerData(interaction.targetUser));
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
        .setColor(utils_1.pixelColor)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYmFubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBTXlCO0FBQ3pCLDJDQVFvQjtBQUNwQix1Q0FBNEQ7QUFFNUQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsZUFBZTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDM0IsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsdUJBQXVCLEVBQUUsQ0FBQyxtQ0FBc0IsQ0FBQyxJQUFJLENBQUM7U0FDekQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQWM7UUFDdEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDMUQsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVlLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFzRDtRQUMzRixNQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsRCxNQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckMsTUFBTSxJQUFBLGFBQUssRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDSjtBQXpCRCxnQ0F5QkM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFVO0lBQzdCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUMzRSxJQUFJLENBQUMsU0FBUztRQUFFLE9BQU87WUFDbkIsTUFBTSxFQUFFLENBQUMsSUFBQSxrQkFBVSxFQUFDO29CQUNoQixLQUFLLEVBQUUsTUFBTTtvQkFDYixLQUFLLEVBQUUsTUFBTTtvQkFDYixXQUFXLEVBQUUsMkNBQTJDO2lCQUMzRCxDQUFDLENBQUM7U0FDTixDQUFDO0lBRUYsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzFCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQVcsQ0FBQztLQUMxRTtJQUVELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTtTQUMzQixRQUFRLENBQUMsa0JBQVUsQ0FBQztTQUNwQixTQUFTLENBQUM7UUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUc7UUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO0tBQ3pELENBQUM7U0FDRCxRQUFRLENBQUMsU0FBUyxDQUFDO1NBQ25CLFlBQVksRUFBRSxDQUFDO0lBRXBCLE1BQU0sR0FBRyxHQUFHLElBQUksNkJBQWdCLEVBQWlCO1NBQzVDLGFBQWEsQ0FBQyxJQUFJLDBCQUFhLEVBQUU7U0FDN0IsUUFBUSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDO1NBQzFCLFFBQVEsQ0FBQyxVQUFVLENBQUM7U0FDcEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUNyQixDQUFDO0lBRU4sT0FBTztRQUNILE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNmLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQztLQUNwQixDQUFDO0FBQ04sQ0FBQyJ9