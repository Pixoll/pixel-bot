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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYXZhdGFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQThGO0FBQzlGLHFEQUE2RjtBQUM3Rix1Q0FBdUM7QUFFdkMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2YsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsZUFBZTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDM0IsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQWM7UUFDdEUsTUFBTSxJQUFJLEdBQUcsVUFBa0IsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRWxELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDMUUsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzFCLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUN6RSxDQUFDO2FBQ0QsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixZQUFZLEVBQUUsQ0FBQztRQUVwQixNQUFNLEdBQUcsR0FBRyxJQUFJLDZCQUFnQixFQUFpQjthQUM1QyxhQUFhLENBQUMsSUFBSSwwQkFBYSxFQUFFO2FBQzdCLFFBQVEsQ0FBQyx3QkFBVyxDQUFDLElBQUksQ0FBQzthQUMxQixRQUFRLENBQUMsVUFBVSxDQUFDO2FBQ3BCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FDckIsQ0FBQztRQUVOLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRSxDQUFDO0NBQ0o7QUF4Q0QsZ0NBd0NDIn0=