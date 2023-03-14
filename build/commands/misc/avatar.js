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
        await (0, utils_1.replyAll)(context, mapAvatarData(user));
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await (0, utils_1.replyAll)(interaction, mapAvatarData(interaction.targetUser));
    }
}
exports.default = AvatarCommand;
function mapAvatarData(user) {
    let avatarUrl = user.displayAvatarURL({ forceStatic: false, size: 2048 });
    if (/\.webp/.test(avatarUrl)) {
        avatarUrl = user.displayAvatarURL({ extension: 'png', size: 2048 });
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('#4c9f4c')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYXZhdGFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBUW9CO0FBQ3BCLHFEQU15QjtBQUN6Qix1Q0FBdUM7QUFFdkMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2YsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsZUFBZTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDM0IsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsdUJBQXVCLEVBQUUsQ0FBQyxtQ0FBc0IsQ0FBQyxJQUFJLENBQUM7U0FDekQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQWM7UUFDdEUsTUFBTSxJQUFJLEdBQUcsVUFBa0IsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ2xELE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0sS0FBSyxDQUFDLGtCQUFrQixDQUFDLFdBQXNEO1FBQ2xGLE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sSUFBQSxnQkFBUSxFQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztDQUNKO0FBekJELGdDQXlCQztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVU7SUFDN0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMxRSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDMUIsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7S0FDdkU7SUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7U0FDM0IsUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUNuQixTQUFTLENBQUM7UUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUc7UUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO0tBQ3pELENBQUM7U0FDRCxRQUFRLENBQUMsU0FBUyxDQUFDO1NBQ25CLFlBQVksRUFBRSxDQUFDO0lBRXBCLE1BQU0sR0FBRyxHQUFHLElBQUksNkJBQWdCLEVBQWlCO1NBQzVDLGFBQWEsQ0FBQyxJQUFJLDBCQUFhLEVBQUU7U0FDN0IsUUFBUSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDO1NBQzFCLFFBQVEsQ0FBQyxVQUFVLENBQUM7U0FDcEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUNyQixDQUFDO0lBRU4sT0FBTztRQUNILE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNmLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQztLQUNwQixDQUFDO0FBQ04sQ0FBQyJ9