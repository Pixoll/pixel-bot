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
            details: '`user` has to be a user\'s username, ID or mention.',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYmFubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTZGO0FBQzdGLDJDQUE4RjtBQUM5Rix1Q0FBbUQ7QUFFbkQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLE9BQU8sRUFBRSxxREFBcUQ7WUFDOUQsTUFBTSxFQUFFLGVBQWU7WUFDdkIsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQzNCLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQWM7UUFDdEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQWtCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWxFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMzRSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLDJDQUEyQzthQUMzRCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUNELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMxQixTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFXLENBQUM7U0FDMUU7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3pFLENBQUM7YUFDRCxRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sR0FBRyxHQUFHLElBQUksNkJBQWdCLEVBQWlCO2FBQzVDLGFBQWEsQ0FBQyxJQUFJLDBCQUFhLEVBQUU7YUFDN0IsUUFBUSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDO2FBQzFCLFFBQVEsQ0FBQyxVQUFVLENBQUM7YUFDcEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUNyQixDQUFDO1FBRU4sTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDSjtBQXJERCxnQ0FxREMifQ==