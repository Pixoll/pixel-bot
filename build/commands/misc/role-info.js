"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'role',
        prompt: 'What role do you want to get information from?',
        type: 'role',
    }];
class RoleInfoCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'role-info',
            aliases: ['roleinfo'],
            group: 'misc',
            description: 'Displays multiple information about a role, such as color, position, members and mod permissions.',
            detailedDescription: '`role` can be either a role\'s name, mention or ID.',
            format: 'role-info [role]',
            examples: ['role-info Staff'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { role }) {
        const { hexColor, id, name, hoist, position, mentionable, members, createdTimestamp, unicodeEmoji } = role;
        const color = hexColor === '#000000' ? null : hexColor;
        const colorURL = color ? `https://www.colorhexa.com/${color.replace('#', '')}.png` : null;
        const url = role.iconURL({ size: 2048 }) || colorURL;
        const permissions = (0, utils_1.getKeyPerms)(role);
        const roleInfo = new discord_js_1.EmbedBuilder()
            .setColor(color || '#4c9f4c')
            .setAuthor({ name: `Information for role: ${name}` })
            .setDescription((0, common_tags_1.stripIndent) `
                **Mention:** \`${role.toString()}\`
                **Color:** ${color && colorURL ? (0, utils_1.hyperlink)(color, colorURL) : 'None'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Position:** ${position}
                **Members:** ${members.size}
            `)
            .setFooter({ text: `Role ID: ${id} • Created at` })
            .setTimestamp(createdTimestamp);
        if (url)
            roleInfo.setThumbnail(url);
        if (permissions !== 'None')
            roleInfo.addFields({
                name: 'Mod permissions',
                value: permissions,
            });
        await (0, utils_1.replyAll)(context, roleInfo);
    }
}
exports.default = RoleInfoCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS1pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2Mvcm9sZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwQztBQUMxQyxxREFBNkY7QUFDN0YsdUNBQStEO0FBRS9ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxnREFBZ0Q7UUFDeEQsSUFBSSxFQUFFLE1BQU07S0FDZixDQUFVLENBQUM7QUFLWixNQUFxQixlQUFnQixTQUFRLHlCQUFzQjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ3JCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLG1HQUFtRztZQUNoSCxtQkFBbUIsRUFBRSxxREFBcUQ7WUFDMUUsTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixRQUFRLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUM3QixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDaEUsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDM0csTUFBTSxLQUFLLEdBQUcsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzFGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxRQUFRLENBQUM7UUFDckQsTUFBTSxXQUFXLEdBQUcsSUFBQSxtQkFBVyxFQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRDLE1BQU0sUUFBUSxHQUFHLElBQUkseUJBQVksRUFBRTthQUM5QixRQUFRLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQzthQUM1QixTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUseUJBQXlCLElBQUksRUFBRSxFQUFFLENBQUM7YUFDcEQsY0FBYyxDQUFDLElBQUEseUJBQVcsRUFBQTtpQ0FDTixJQUFJLENBQUMsUUFBUSxFQUFFOzZCQUNuQixLQUFLLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFBLGlCQUFTLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNOzZCQUN2RCxZQUFZLElBQUksTUFBTTsrQkFDcEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7bUNBQ2hCLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO2dDQUM3QixRQUFROytCQUNULE9BQU8sQ0FBQyxJQUFJO2FBQzlCLENBQUM7YUFDRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxDQUFDO2FBQ2xELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXBDLElBQUksR0FBRztZQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFcEMsSUFBSSxXQUFXLEtBQUssTUFBTTtZQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUM7Z0JBQzNDLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLEtBQUssRUFBRSxXQUFXO2FBQ3JCLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBQ0o7QUEvQ0Qsa0NBK0NDIn0=