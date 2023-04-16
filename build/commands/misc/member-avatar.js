"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'member',
        prompt: 'What member do you want to get their server avatar from?',
        type: 'member',
        required: false,
    }];
class MemberAvatarCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'member-avatar',
            aliases: ['memberavatar', 'mavatar', 'mav'],
            group: 'misc',
            description: 'Displays a member\'s server avatar, or yours if you don\'t specify any.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`member\` can be either a member's name, mention or ID.
                If no server avatar was found, it will display the user\'s avatar instead.
            `,
            format: 'member-avatar <member>',
            examples: ['member-avatar Pixoll'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { member: passedMember }) {
        const member = await context.guild.members.fetch(passedMember?.id ?? context.member?.id ?? '').catch(() => null);
        if (!member) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'Invalid member',
            }));
            return;
        }
        const { user, displayName } = member;
        let avatarUrl = member.displayAvatarURL({ forceStatic: false, size: 2048 });
        if (avatarUrl && /\.webp/.test(avatarUrl)) {
            avatarUrl = member.displayAvatarURL({ extension: 'png', size: 2048 });
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${user.tag} • AKA ${displayName}`,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setImage(avatarUrl)
            .setTimestamp();
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setLabel('Download')
            .setURL(avatarUrl));
        await (0, utils_1.reply)(context, { embeds: [embed], components: [row] });
    }
}
exports.default = MemberAvatarCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVyLWF2YXRhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9taXNjL21lbWJlci1hdmF0YXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQXdGO0FBQ3hGLHFEQUE2RjtBQUM3Rix1Q0FBNEQ7QUFFNUQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLDBEQUEwRDtRQUNsRSxJQUFJLEVBQUUsUUFBUTtRQUNkLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLG1CQUFvQixTQUFRLHlCQUFzQjtJQUNuRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGVBQWU7WUFDckIsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUM7WUFDM0MsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUseUVBQXlFO1lBQ3RGLG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7O2FBRy9CO1lBQ0QsTUFBTSxFQUFFLHdCQUF3QjtZQUNoQyxRQUFRLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztZQUNsQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFjO1FBQ2hGLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUM1QyxZQUFZLEVBQUUsRUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FDL0MsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLGdCQUFnQjthQUNoQyxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ3JDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFXLENBQUM7UUFDdEYsSUFBSSxTQUFTLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN2QyxTQUFTLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQVcsQ0FBQztTQUNuRjtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsa0JBQVUsQ0FBQzthQUNwQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxVQUFVLFdBQVcsRUFBRTtZQUN4QyxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3pELENBQUM7YUFDRCxRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sR0FBRyxHQUFHLElBQUksNkJBQWdCLEVBQWlCO2FBQzVDLGFBQWEsQ0FBQyxJQUFJLDBCQUFhLEVBQUU7YUFDN0IsUUFBUSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDO2FBQzFCLFFBQVEsQ0FBQyxVQUFVLENBQUM7YUFDcEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUNyQixDQUFDO1FBRU4sTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUNKO0FBeERELHNDQXdEQyJ9