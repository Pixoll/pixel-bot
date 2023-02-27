"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
/**
 * Formats the {@link PermissionsBitField} into an array of string
 * @param perms The permissions to format
 */
function format(perms) {
    return perms?.toArray().map(perm => pixoll_commando_1.Util.permissions[perm]) || [];
}
/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param link The link of the image
 */
function imageLink(link) {
    if (link)
        return `[Click here](${link})`;
    return 'None';
}
/** Handles all of the role logs. */
function default_1(client) {
    client.on('roleCreate', async (role) => {
        const { guild, id, hexColor, mentionable, hoist, tags, unicodeEmoji } = role;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'roles');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/roles#create".');
        const color = hexColor === '#000000' ? null : hexColor;
        const colorURL = color ? `https://www.color-hex.com/color/${color.replace('#', '')}` : null;
        const url = role.iconURL({ size: 2048 }) || colorURL;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Green')
            .setAuthor({
            name: 'Created role',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Role:** ${role.toString()}
                **Color:** ${color ? `[${color}](${colorURL})` : 'None'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${(0, functions_1.getKeyPerms)(role)}
            `)
            .setFooter({ text: `Role ID: ${id}` })
            .setTimestamp();
        if (url)
            embed.setThumbnail(url);
        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null;
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null;
            const boost = tags.premiumSubscriberRole ? 'Default Server Booster role.' : null;
            const tagsArr = [bot, integration, boost].filter(t => t);
            if (tagsArr.length !== 0)
                embed.addFields({
                    name: 'Tags',
                    value: tagsArr.join('\n'),
                });
        }
        guild.queuedLogs.push(embed);
    });
    client.on('roleDelete', async (role) => {
        const { guild, id, name, hexColor, mentionable, hoist, tags, unicodeEmoji } = role;
        if (!guild.available)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'roles');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/roles#delete".');
        const color = hexColor === '#000000' ? null : hexColor;
        const colorURL = color ? `https://www.color-hex.com/color/${color.replace('#', '')}` : null;
        const url = role.iconURL({ size: 2048 }) || colorURL;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted role',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Name:** ${name}
                **Color:** ${color ? `[${color}](${colorURL})` : 'No color'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${(0, functions_1.getKeyPerms)(role)}
            `)
            .setFooter({ text: `Role ID: ${id}` })
            .setTimestamp();
        if (url)
            embed.setThumbnail(url);
        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null;
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null;
            const boost = tags.premiumSubscriberRole ? 'Default Server Booster role.' : null;
            const tagsArr = [bot, integration, boost].filter(t => t);
            if (tagsArr.length !== 0)
                embed.addFields({
                    name: 'Tags',
                    value: tagsArr.join('\n'),
                });
        }
        guild.queuedLogs.push(embed);
    });
    client.on('roleUpdate', async (oldRole, newRole) => {
        const { guild, id } = oldRole;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'roles');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/roles#update".');
        const { name: name1, hexColor: color1, hoist: hoist1, mentionable: mention1, permissions: perms1, unicodeEmoji: emoji1, icon: icon1, } = oldRole;
        const { name: name2, hexColor: color2, hoist: hoist2, mentionable: mention2, permissions: perms2, unicodeEmoji: emoji2, icon: icon2, } = newRole;
        const [added, removed] = (0, functions_1.compareArrays)(format(perms1), format(perms2));
        const color1link = `https://www.color-hex.com/color/${color1.replace('#', '')}`;
        const color2link = `https://www.color-hex.com/color/${color2.replace('#', '')}`;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated role',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(oldRole.toString())
            .setFooter({ text: `Role ID: ${id}` })
            .setTimestamp();
        if (name1 !== name2)
            embed.addFields({
                name: 'Name',
                value: `${name1} ➜ ${name2}`,
            });
        if (color1 !== color2)
            embed.addFields({
                name: 'Color',
                value: `[${color1}](${color1link}) ➜ [${color2}](${color2link})`,
            });
        if (emoji1 !== emoji2)
            embed.addFields({
                name: 'Emoji',
                value: `${emoji1 || 'None'} ➜ ${emoji2 || 'None'}`,
            });
        if (icon1 !== icon2) {
            embed.addFields({
                name: 'Icon',
                value: (0, common_tags_1.stripIndent) `
                **Before:** ${imageLink(oldRole.iconURL({ size: 2048 }))}
                **After:** ${imageLink(newRole.iconURL({ size: 2048 }))}
            `
            }).setThumbnail(newRole.iconURL({ size: 2048 }));
        }
        if (hoist1 !== hoist2)
            embed.addFields({
                name: 'Hoisted',
                value: (0, functions_1.yesOrNo)(hoist1),
            });
        if (mention1 !== mention2)
            embed.addFields({
                name: 'Mentionable',
                value: (0, functions_1.yesOrNo)(mention1),
            });
        if (added.length !== 0)
            embed.addFields({
                name: `${(0, functions_1.customEmoji)('check')} Allowed permissions`,
                value: added.join(', '),
            });
        if (removed.length !== 0)
            embed.addFields({
                name: `${(0, functions_1.customEmoji)('cross')} Denied permissions`,
                value: removed.join(', '),
            });
        if (embed.data.fields?.length !== 0)
            guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL3JvbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUErRDtBQUMvRCxxREFBdUQ7QUFDdkQscURBQStHO0FBRS9HOzs7R0FHRztBQUNILFNBQVMsTUFBTSxDQUFDLEtBQXFDO0lBQ2pELE9BQU8sS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3RFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxJQUFtQjtJQUNsQyxJQUFJLElBQUk7UUFBRSxPQUFPLGdCQUFnQixJQUFJLEdBQUcsQ0FBQztJQUN6QyxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsb0NBQW9DO0FBQ3BDLG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUMsSUFBSSxFQUFDLEVBQUU7UUFDakMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQztRQUM3RSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsZ0NBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztRQUUzRCxNQUFNLEtBQUssR0FBRyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUN2RCxN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