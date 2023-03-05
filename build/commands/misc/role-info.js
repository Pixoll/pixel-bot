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
            details: '`role` can be either a role\'s name, mention or ID.',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS1pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2Mvcm9sZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwQztBQUMxQyxxREFBNkY7QUFDN0YsdUNBQStEO0FBRS9ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxnREFBZ0Q7UUFDeEQsSUFBSSxFQUFFLE1BQU07S0FDZixDQUFVLENBQUM7QUFLWixNQUFxQixlQUFnQixTQUFRLHlCQUFzQjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ3JCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLG1HQUFtRztZQUNoSCxPQUFPLEVBQUUscURBQXFEO1lBQzlELE1BQU0sRUFBRSxrQkFBa0I7WUFDMUIsUUFBUSxFQUFFLENBQUMsaUJBQWlCLENBQUM7WUFDN0IsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQ2hFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzNHLE1BQU0sS0FBSyxHQUFHLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3ZELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksUUFBUSxDQUFDO1FBQ3JELE1BQU0sV0FBVyxHQUFHLElBQUEsbUJBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUV0QyxNQUFNLFFBQVEsR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDOUIsUUFBUSxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUM7YUFDNUIsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixJQUFJLEVBQUUsRUFBRSxDQUFDO2FBQ3BELGNBQWMsQ0FBQyxJQUFBLHlCQUFXLEVBQUE7aUNBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRTs2QkFDbkIsS0FBSyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBQSxpQkFBUyxFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTs2QkFDdkQsWUFBWSxJQUFJLE1BQU07K0JBQ3BCLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO21DQUNoQixXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtnQ0FDN0IsUUFBUTsrQkFDVCxPQUFPLENBQUMsSUFBSTthQUM5QixDQUFDO2FBQ0QsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsQ0FBQzthQUNsRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVwQyxJQUFJLEdBQUc7WUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBDLElBQUksV0FBVyxLQUFLLE1BQU07WUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUMzQyxJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixLQUFLLEVBQUUsV0FBVzthQUNyQixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEMsQ0FBQztDQUNKO0FBL0NELGtDQStDQyJ9