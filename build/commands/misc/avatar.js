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
            details: '`user` has to be a user\'s username, ID or mention.',
            format: 'avatar <user>',
            examples: ['avatar Pixoll'],
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user: passedUser }) {
        const user = passedUser ?? context.author;
        let avatarUrl = user.displayAvatarURL({ forceStatic: false, size: 2048 });
        if (/\.webp/.test(avatarUrl)) {
            avatarUrl = user.displayAvatarURL({ extension: 'png', size: 2048 });
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: user.tag, iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setImage(avatarUrl)
            .setTimestamp();
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setLabel('Download')
            .setURL(avatarUrl));
        await (0, utils_1.replyAll)(context, { embeds: [embed], components: [row] });
    }
}
exports.default = AvatarCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYXZhdGFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQThGO0FBQzlGLHFEQUE2RjtBQUM3Rix1Q0FBdUM7QUFFdkMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2YsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLE9BQU8sRUFBRSxxREFBcUQ7WUFDOUQsTUFBTSxFQUFFLGVBQWU7WUFDdkIsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQzNCLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFjO1FBQ3RFLE1BQU0sSUFBSSxHQUFHLFVBQWtCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUVsRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMxQixTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN2RTtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDekUsQ0FBQzthQUNELFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsWUFBWSxFQUFFLENBQUM7UUFFcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSw2QkFBZ0IsRUFBaUI7YUFDNUMsYUFBYSxDQUFDLElBQUksMEJBQWEsRUFBRTthQUM3QixRQUFRLENBQUMsd0JBQVcsQ0FBQyxJQUFJLENBQUM7YUFDMUIsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLENBQ3JCLENBQUM7UUFFTixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEUsQ0FBQztDQUNKO0FBeENELGdDQXdDQyJ9