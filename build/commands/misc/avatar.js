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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYXZhdGFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBUW9CO0FBQ3BCLHFEQU15QjtBQUN6Qix1Q0FBZ0Q7QUFFaEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBeUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2YsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsZ0VBQWdFO1lBQzdFLG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsZUFBZTtZQUN2QixRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDM0IsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsdUJBQXVCLEVBQUUsQ0FBQyxtQ0FBc0IsQ0FBQyxJQUFJLENBQUM7U0FDekQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQWM7UUFDdEUsTUFBTSxJQUFJLEdBQUcsVUFBNkIsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzdELE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsV0FBc0Q7UUFDbEYsTUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEQsTUFBTSxJQUFBLGFBQUssRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDSjtBQXpCRCxnQ0F5QkM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFVO0lBQzdCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUUsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzFCLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZFO0lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO1NBQzNCLFFBQVEsQ0FBQyxrQkFBVSxDQUFDO1NBQ3BCLFNBQVMsQ0FBQztRQUNQLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRztRQUNkLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7S0FDekQsQ0FBQztTQUNELFFBQVEsQ0FBQyxTQUFTLENBQUM7U0FDbkIsWUFBWSxFQUFFLENBQUM7SUFFcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSw2QkFBZ0IsRUFBaUI7U0FDNUMsYUFBYSxDQUFDLElBQUksMEJBQWEsRUFBRTtTQUM3QixRQUFRLENBQUMsd0JBQVcsQ0FBQyxJQUFJLENBQUM7U0FDMUIsUUFBUSxDQUFDLFVBQVUsQ0FBQztTQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLENBQ3JCLENBQUM7SUFFTixPQUFPO1FBQ0gsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2YsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDO0tBQ3BCLENBQUM7QUFDTixDQUFDIn0=