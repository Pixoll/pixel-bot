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
            details: (0, common_tags_1.stripIndent) `
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
            .setColor('#4c9f4c')
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
        await (0, utils_1.replyAll)(context, { embeds: [embed], components: [row] });
    }
}
exports.default = MemberAvatarCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVyLWF2YXRhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9taXNjL21lbWJlci1hdmF0YXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQXdGO0FBQ3hGLHFEQUE2RjtBQUM3Rix1Q0FBbUQ7QUFFbkQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLDBEQUEwRDtRQUNsRSxJQUFJLEVBQUUsUUFBUTtRQUNkLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLG1CQUFvQixTQUFRLHlCQUFzQjtJQUNuRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGVBQWU7WUFDckIsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUM7WUFDM0MsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUseUVBQXlFO1lBQ3RGLE9BQU8sRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUduQjtZQUNELE1BQU0sRUFBRSx3QkFBd0I7WUFDaEMsUUFBUSxFQUFFLENBQUMsc0JBQXNCLENBQUM7WUFDbEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBYztRQUNoRixNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDNUMsWUFBWSxFQUFFLEVBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQy9DLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsZ0JBQWdCO2FBQ2hDLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDckMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQVcsQ0FBQztRQUN0RixJQUFJLFNBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZDLFNBQVMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBVyxDQUFDO1NBQ25GO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsVUFBVSxXQUFXLEVBQUU7WUFDeEMsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUN6RCxDQUFDO2FBQ0QsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixZQUFZLEVBQUUsQ0FBQztRQUVwQixNQUFNLEdBQUcsR0FBRyxJQUFJLDZCQUFnQixFQUFpQjthQUM1QyxhQUFhLENBQUMsSUFBSSwwQkFBYSxFQUFFO2FBQzdCLFFBQVEsQ0FBQyx3QkFBVyxDQUFDLElBQUksQ0FBQzthQUMxQixRQUFRLENBQUMsVUFBVSxDQUFDO2FBQ3BCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FDckIsQ0FBQztRQUVOLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRSxDQUFDO0NBQ0o7QUF4REQsc0NBd0RDIn0=