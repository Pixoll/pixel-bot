"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const { version, description } = require('../../../package.json');
const djsDocsUrl = `https://discord.js.org/#/docs/discord.js/${discord_js_1.version}/general/welcome`;
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
                **Library:** ${(0, utils_1.hyperlink)('discord.js v' + discord_js_1.version, djsDocsUrl)}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2luZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQTBDO0FBQzFDLDJDQUFpRTtBQUNqRSxxREFBb0c7QUFDcEcsdUNBQXFIO0FBR3JILE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUEyQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzVHLE1BQU0sVUFBVSxHQUFHLDRDQUE0QyxvQkFBVSxrQkFBa0IsQ0FBQztBQUU1RixNQUFxQixXQUFZLFNBQVEseUJBQU87SUFDNUMsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ2xCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLDBDQUEwQztZQUN2RCxPQUFPLEVBQUUsSUFBSTtZQUNiLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUI7UUFDcEMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMzQixNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBRW5DLE1BQU0sU0FBUyxHQUFHLElBQUEsb0JBQVEsRUFBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUU3RSxNQUFNLElBQUksR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDMUIsUUFBUSxDQUFDLGtCQUFVLENBQUM7YUFDcEIsUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2xDLGNBQWMsQ0FBQyxJQUFBLHlCQUFXLEVBQUE7NEJBQ1gsS0FBSyxpQkFBaUIsTUFBTSxDQUFDLElBQUk7a0JBQzNDLFdBQVc7YUFDaEIsQ0FBQzthQUNELFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxhQUFhO1lBQ25CLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7K0JBQ0gsT0FBTzt5Q0FDRyxpQkFBUzsrQkFDbkIsSUFBQSxpQkFBUyxFQUFDLGNBQWMsR0FBRyxvQkFBVSxFQUFFLFVBQVUsQ0FBQztpQ0FDaEQsSUFBQSxpQkFBUyxFQUFDLG1CQUFtQixHQUFHLHlCQUFhLEVBQUUsMkNBQTJDLENBQUM7aUNBQzNGLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7aUJBQzFEO1lBQ0QsTUFBTSxFQUFFLElBQUk7U0FDZixFQUFFO1lBQ0MsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBO29CQUNkLElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsRUFBRSx3QkFBZ0IsQ0FBQztvQkFDN0MsSUFBQSxpQkFBUyxFQUFDLGtCQUFrQixFQUFFLHlCQUFpQixDQUFDO29CQUNoRCxJQUFBLGlCQUFTLEVBQUMsYUFBYSxFQUFFLGdCQUFRLENBQUM7b0JBQ2xDLElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztvQkFDdkQsSUFBQSxpQkFBUyxFQUFDLGdCQUFnQixFQUFFLGdCQUFRLEdBQUcsU0FBUyxDQUFDO29CQUNqRCxJQUFBLGlCQUFTLEVBQUMsV0FBVyxFQUFFLGdCQUFRLEdBQUcsT0FBTyxDQUFDO2lCQUM3QztZQUNELE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQzthQUNELFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLFNBQVMsRUFBRSxFQUFFLENBQUM7YUFDM0MsWUFBWSxFQUFFLENBQUM7UUFFcEIsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztDQUNKO0FBdERELDhCQXNEQyJ9