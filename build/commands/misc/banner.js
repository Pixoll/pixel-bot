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
        });
    }
    /**
     * Runs the command
     * @param {CommandContext} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the banner from
     */
    async run(context, { user: passedUser }) {
        const user = await (passedUser ?? context.author).fetch();
        let bannerUrl = user.bannerURL({ forceStatic: false, size: 2048 }) ?? null;
        if (!bannerUrl) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'That user has no banner on their profile.',
            }));
            return;
        }
        if (/\.webp/.test(bannerUrl)) {
            bannerUrl = user.bannerURL({ extension: 'png', size: 2048 });
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: user.tag, iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setImage(bannerUrl)
            .setTimestamp();
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setLabel('Download')
            .setURL(bannerUrl));
        await (0, utils_1.replyAll)(context, { embeds: [embed], components: [row] });
    }
}
exports.default = BannerCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYmFubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTZGO0FBQzdGLDJDQUE4RjtBQUM5Rix1Q0FBbUQ7QUFFbkQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsZUFBZTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDM0IsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBYztRQUN0RSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBa0IsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbEUsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzNFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDWixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsMkNBQTJDO2FBQzNELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBQ0QsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzFCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQVcsQ0FBQztTQUMxRTtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDekUsQ0FBQzthQUNELFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsWUFBWSxFQUFFLENBQUM7UUFFcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSw2QkFBZ0IsRUFBaUI7YUFDNUMsYUFBYSxDQUFDLElBQUksMEJBQWEsRUFBRTthQUM3QixRQUFRLENBQUMsd0JBQVcsQ0FBQyxJQUFJLENBQUM7YUFDMUIsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLENBQ3JCLENBQUM7UUFFTixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEUsQ0FBQztDQUNKO0FBckRELGdDQXFEQyJ9