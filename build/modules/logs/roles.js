"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
        return (0, utils_1.hyperlink)('Click here', link);
    return 'None';
}
/** Handles all of the role logs. */
function default_1(client) {
    client.on('roleCreate', async (role) => {
        const { guild, id, hexColor, mentionable, hoist, tags, unicodeEmoji } = role;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'roles');
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
                **Color:** ${color && colorURL ? (0, utils_1.hyperlink)(color, colorURL) : 'No color'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${(0, utils_1.getKeyPerms)(role)}
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
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'roles');
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
                **Color:** ${color && colorURL ? (0, utils_1.hyperlink)(color, colorURL) : 'No color'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${(0, utils_1.getKeyPerms)(role)}
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
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'roles');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/roles#update".');
        const { name: name1, hexColor: color1, hoist: hoist1, mentionable: mention1, permissions: perms1, unicodeEmoji: emoji1, icon: icon1, } = oldRole;
        const { name: name2, hexColor: color2, hoist: hoist2, mentionable: mention2, permissions: perms2, unicodeEmoji: emoji2, icon: icon2, } = newRole;
        const [added, removed] = (0, utils_1.compareArrays)(format(perms1), format(perms2));
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
                value: `${(0, utils_1.hyperlink)(color1, color1link)} ➜ ${(0, utils_1.hyperlink)(color2, color2link)}`,
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
                value: (0, utils_1.yesOrNo)(hoist1),
            });
        if (mention1 !== mention2)
            embed.addFields({
                name: 'Mentionable',
                value: (0, utils_1.yesOrNo)(mention1),
            });
        if (added.length !== 0)
            embed.addFields({
                name: `${(0, utils_1.customEmoji)('check')} Allowed permissions`,
                value: added.join(', '),
            });
        if (removed.length !== 0)
            embed.addFields({
                name: `${(0, utils_1.customEmoji)('cross')} Denied permissions`,
                value: removed.join(', '),
            });
        if (embed.data.fields?.length !== 0)
            guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL3JvbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUErRDtBQUMvRCxxREFBdUQ7QUFDdkQsdUNBQWdIO0FBRWhIOzs7R0FHRztBQUNILFNBQVMsTUFBTSxDQUFDLEtBQXFDO0lBQ2pELE9BQU8sS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3RFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxJQUFtQjtJQUNsQyxJQUFJLElBQUk7UUFBRSxPQUFPLElBQUEsaUJBQVMsRUFBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0MsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUVELG9DQUFvQztBQUNwQyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFDLElBQUksRUFBQyxFQUFFO1FBQ2pDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDN0UsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FB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