"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const { version, description } = require('../../../package.json');
class InfoCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'info',
            aliases: ['about'],
            group: 'info',
            description: 'Displays some information about the bot.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { client } = context;
        const { user, owners, options, uptime } = client;
        const guilds = client.guilds.cache;
        const uptimeStr = (0, better_ms_1.prettyMs)(uptime, { verbose: true, unitCount: 2 });
        const topgg = 'https://top.gg/bot/802267523058761759';
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString();
        const info = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setTitle(`About ${user.username}`)
            .setDescription((0, common_tags_1.stripIndent) `
                **Serving ${users} users across ${guilds.size} servers!**
                ${description}
            `)
            .addFields({
            name: 'Information',
            value: (0, common_tags_1.stripIndent) `
                **Version:** ${version}
                **Library:** ${(0, utils_1.hyperlink)('discord.js v' + discord_js_1.version, 'https://discord.js.org/#/')}
                **Framework:** ${(0, utils_1.hyperlink)('pixoll-commando v' + pixoll_commando_1.version, 'https://github.com/Pixoll/pixoll-commando')}
                **Developer:** ${owners?.[0].toString()} (${owners?.[0].tag})
                `,
            inline: true,
        }, {
            name: 'Links',
            value: (0, common_tags_1.stripIndent) `
                • ${(0, utils_1.hyperlink)('Top.gg page', topgg)}
                • ${(0, utils_1.hyperlink)('Support server', options.serverInvite ?? '')}
                • ${(0, utils_1.hyperlink)('Invite the bot', topgg + '/invite')}
                • ${(0, utils_1.hyperlink)('Vote here', topgg + '/vote')}
                `,
            inline: true,
        })
            .setFooter({
            text: `Uptime: ${uptimeStr}`,
        })
            .setTimestamp();
        await (0, utils_1.replyAll)(context, info);
    }
}
exports.default = InfoCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2luZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQTBDO0FBQzFDLDJDQUFpRTtBQUNqRSxxREFBb0c7QUFDcEcsdUNBQWtEO0FBR2xELE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUEyQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTVHLE1BQXFCLFdBQVksU0FBUSx5QkFBTztJQUM1QyxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDbEIsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsMENBQTBDO1lBQ3ZELE9BQU8sRUFBRSxJQUFJO1lBQ2Isd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QjtRQUNwQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzNCLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFbkMsTUFBTSxTQUFTLEdBQUcsSUFBQSxvQkFBUSxFQUFDLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEUsTUFBTSxLQUFLLEdBQUcsdUNBQXVDLENBQUM7UUFDdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTdFLE1BQU0sSUFBSSxHQUFHLElBQUkseUJBQVksRUFBRTthQUMxQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFFBQVEsQ0FBQyxTQUFTLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNsQyxjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBOzRCQUNYLEtBQUssaUJBQWlCLE1BQU0sQ0FBQyxJQUFJO2tCQUMzQyxXQUFXO2FBQ2hCLENBQUM7YUFDRCxTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBOytCQUNILE9BQU87K0JBQ1AsSUFBQSxpQkFBUyxFQUFDLGNBQWMsR0FBRyxvQkFBVSxFQUFFLDJCQUEyQixDQUFDO2lDQUNqRSxJQUFBLGlCQUFTLEVBQUMsbUJBQW1CLEdBQUcseUJBQWEsRUFBRSwyQ0FBMkMsQ0FBQztpQ0FDM0YsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztpQkFDMUQ7WUFDRCxNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7b0JBQ2QsSUFBQSxpQkFBUyxFQUFDLGFBQWEsRUFBRSxLQUFLLENBQUM7b0JBQy9CLElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztvQkFDdkQsSUFBQSxpQkFBUyxFQUFDLGdCQUFnQixFQUFFLEtBQUssR0FBRyxTQUFTLENBQUM7b0JBQzlDLElBQUEsaUJBQVMsRUFBQyxXQUFXLEVBQUUsS0FBSyxHQUFHLE9BQU8sQ0FBQztpQkFDMUM7WUFDRCxNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUM7YUFDRCxTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsV0FBVyxTQUFTLEVBQUU7U0FDL0IsQ0FBQzthQUNELFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUF0REQsOEJBc0RDIn0=