import { stripIndent } from 'common-tags';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { CommandoClient, Util } from 'pixoll-commando';
import { customEmoji, isGuildModuleEnabled, getKeyPerms, compareArrays, yesOrNo, hyperlink } from '../../utils';

/**
 * Formats the {@link PermissionsBitField} into an array of string
 * @param perms The permissions to format
 */
function format(perms?: Readonly<PermissionsBitField>): string[] {
    return perms?.toArray().map(perm => Util.permissions[perm]) || [];
}

/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param link The link of the image
 */
function imageLink(link: string | null): string {
    if (link) return hyperlink('Click here', link);
    return 'None';
}

/** Handles all of the role logs. */
export default function (client: CommandoClient<true>): void {
    client.on('roleCreate', async role => {
        const { guild, id, hexColor, mentionable, hoist, tags, unicodeEmoji } = role;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'roles');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/roles#create".');

        const color = hexColor === '#000000' ? null : hexColor;
        const colorURL = color ? `https://www.color-hex.com/color/${color.replace('#', '')}` : null;
        const url = role.iconURL({ size: 2048 }) || colorURL;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: 'Created role',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                **Role:** ${role.toString()}
                **Color:** ${color && colorURL ? hyperlink(color, colorURL) : 'No color'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${getKeyPerms(role)}
            `)
            .setFooter({ text: `Role ID: ${id}` })
            .setTimestamp();

        if (url) embed.setThumbnail(url);

        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null;
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null;
            const boost = tags.premiumSubscriberRole ? 'Default Server Booster role.' : null;
            const tagsArr = [bot, integration, boost].filter(t => t);
            if (tagsArr.length !== 0) embed.addFields({
                name: 'Tags',
                value: tagsArr.join('\n'),
            });
        }

        guild.queuedLogs.push(embed);
    });

    client.on('roleDelete', async role => {
        const { guild, id, name, hexColor, mentionable, hoist, tags, unicodeEmoji } = role;
        if (!guild.available) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'roles');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/roles#delete".');

        const color = hexColor === '#000000' ? null : hexColor;
        const colorURL = color ? `https://www.color-hex.com/color/${color.replace('#', '')}` : null;
        const url = role.iconURL({ size: 2048 }) || colorURL;

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Deleted role',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                **Name:** ${name}
                **Color:** ${color && colorURL ? hyperlink(color, colorURL) : 'No color'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${getKeyPerms(role)}
            `)
            .setFooter({ text: `Role ID: ${id}` })
            .setTimestamp();

        if (url) embed.setThumbnail(url);

        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null;
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null;
            const boost = tags.premiumSubscriberRole ? 'Default Server Booster role.' : null;
            const tagsArr = [bot, integration, boost].filter(t => t);
            if (tagsArr.length !== 0) embed.addFields({
                name: 'Tags',
                value: tagsArr.join('\n'),
            });
        }

        guild.queuedLogs.push(embed);
    });

    client.on('roleUpdate', async (oldRole, newRole) => {
        const { guild, id } = oldRole;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'roles');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/roles#update".');

        const {
            name: name1, hexColor: color1, hoist: hoist1, mentionable: mention1,
            permissions: perms1, unicodeEmoji: emoji1, icon: icon1,
        } = oldRole;
        const {
            name: name2, hexColor: color2, hoist: hoist2, mentionable: mention2,
            permissions: perms2, unicodeEmoji: emoji2, icon: icon2,
        } = newRole;

        const [added, removed] = compareArrays(format(perms1), format(perms2));

        const color1link = `https://www.color-hex.com/color/${color1.replace('#', '')}`;
        const color2link = `https://www.color-hex.com/color/${color2.replace('#', '')}`;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated role',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(oldRole.toString())
            .setFooter({ text: `Role ID: ${id}` })
            .setTimestamp();

        if (name1 !== name2) embed.addFields({
            name: 'Name',
            value: `${name1} ➜ ${name2}`,
        });

        if (color1 !== color2) embed.addFields({
            name: 'Color',
            value: `${hyperlink(color1, color1link)} ➜ ${hyperlink(color2, color2link)}`,
        });

        if (emoji1 !== emoji2) embed.addFields({
            name: 'Emoji',
            value: `${emoji1 || 'None'} ➜ ${emoji2 || 'None'}`,
        });

        if (icon1 !== icon2) {
            embed.addFields({
                name: 'Icon',
                value: stripIndent`
                **Before:** ${imageLink(oldRole.iconURL({ size: 2048 }))}
                **After:** ${imageLink(newRole.iconURL({ size: 2048 }))}
            `}).setThumbnail(newRole.iconURL({ size: 2048 }));
        }

        if (hoist1 !== hoist2) embed.addFields({
            name: 'Hoisted',
            value: yesOrNo(hoist1),
        });

        if (mention1 !== mention2) embed.addFields({
            name: 'Mentionable',
            value: yesOrNo(mention1),
        });

        if (added.length !== 0) embed.addFields({
            name: `${customEmoji('check')} Allowed permissions`,
            value: added.join(', '),
        });

        if (removed.length !== 0) embed.addFields({
            name: `${customEmoji('cross')} Denied permissions`,
            value: removed.join(', '),
        });

        if (embed.data.fields?.length !== 0) guild.queuedLogs.push(embed);
    });
}
