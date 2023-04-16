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
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString();
        const info = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setTitle(`About ${user.username}`)
            .setDescription((0, common_tags_1.stripIndent) `
                **Serving ${users} users across ${guilds.size} servers!**
                ${description}
            `)
            .addFields({
            name: 'Information',
            value: (0, common_tags_1.stripIndent) `
                **Version:** ${version}
                **GitHub Repository:** ${utils_1.githubUrl}
                **Library:** ${(0, utils_1.hyperlink)('discord.js v' + discord_js_1.version, 'https://discord.js.org/#/')}
                **Framework:** ${(0, utils_1.hyperlink)('pixoll-commando v' + pixoll_commando_1.version, 'https://github.com/Pixoll/pixoll-commando')}
                **Developer:** ${owners?.[0].toString()} (${owners?.[0].tag})
                `,
            inline: true,
        }, {
            name: 'Links',
            value: (0, common_tags_1.stripIndent) `
                • ${(0, utils_1.hyperlink)('Privacy Policy', utils_1.privacyPolicyUrl)}
                • ${(0, utils_1.hyperlink)('Terms of Service', utils_1.termsOfServiceUrl)}
                • ${(0, utils_1.hyperlink)('Top.gg page', utils_1.topggUrl)}
                • ${(0, utils_1.hyperlink)('Support server', options.serverInvite ?? '')}
                • ${(0, utils_1.hyperlink)('Invite the bot', utils_1.topggUrl + '/invite')}
                • ${(0, utils_1.hyperlink)('Vote here', utils_1.topggUrl + '/vote')}
                `,
            inline: true,
        })
            .setFooter({ text: `Uptime: ${uptimeStr}` })
            .setTimestamp();
        await (0, utils_1.reply)(context, info);
    }
}
exports.default = InfoCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2luZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQTBDO0FBQzFDLDJDQUFpRTtBQUNqRSxxREFBb0c7QUFDcEcsdUNBQXFIO0FBR3JILE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUEyQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTVHLE1BQXFCLFdBQVksU0FBUSx5QkFBTztJQUM1QyxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDbEIsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsMENBQTBDO1lBQ3ZELE9BQU8sRUFBRSxJQUFJO1lBQ2Isd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QjtRQUNwQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzNCLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFbkMsTUFBTSxTQUFTLEdBQUcsSUFBQSxvQkFBUSxFQUFDLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTdFLE1BQU0sSUFBSSxHQUFHLElBQUkseUJBQVksRUFBRTthQUMxQixRQUFRLENBQUMsa0JBQVUsQ0FBQzthQUNwQixRQUFRLENBQUMsU0FBUyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDbEMsY0FBYyxDQUFDLElBQUEseUJBQVcsRUFBQTs0QkFDWCxLQUFLLGlCQUFpQixNQUFNLENBQUMsSUFBSTtrQkFDM0MsV0FBVzthQUNoQixDQUFDO2FBQ0QsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLGFBQWE7WUFDbkIsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTsrQkFDSCxPQUFPO3lDQUNHLGlCQUFTOytCQUNuQixJQUFBLGlCQUFTLEVBQUMsY0FBYyxHQUFHLG9CQUFVLEVBQUUsMkJBQTJCLENBQUM7aUNBQ2pFLElBQUEsaUJBQVMsRUFBQyxtQkFBbUIsR0FBRyx5QkFBYSxFQUFFLDJDQUEyQyxDQUFDO2lDQUMzRixNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO2lCQUMxRDtZQUNELE1BQU0sRUFBRSxJQUFJO1NBQ2YsRUFBRTtZQUNDLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTtvQkFDZCxJQUFBLGlCQUFTLEVBQUMsZ0JBQWdCLEVBQUUsd0JBQWdCLENBQUM7b0JBQzdDLElBQUEsaUJBQVMsRUFBQyxrQkFBa0IsRUFBRSx5QkFBaUIsQ0FBQztvQkFDaEQsSUFBQSxpQkFBUyxFQUFDLGFBQWEsRUFBRSxnQkFBUSxDQUFDO29CQUNsQyxJQUFBLGlCQUFTLEVBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7b0JBQ3ZELElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsRUFBRSxnQkFBUSxHQUFHLFNBQVMsQ0FBQztvQkFDakQsSUFBQSxpQkFBUyxFQUFDLFdBQVcsRUFBRSxnQkFBUSxHQUFHLE9BQU8sQ0FBQztpQkFDN0M7WUFDRCxNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUM7YUFDRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxTQUFTLEVBQUUsRUFBRSxDQUFDO2FBQzNDLFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7Q0FDSjtBQXRERCw4QkFzREMifQ==