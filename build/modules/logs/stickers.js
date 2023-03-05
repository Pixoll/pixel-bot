"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/** Handles all of the sticker logs. */
function default_1(client) {
    client.on('stickerCreate', async (sticker) => {
        const { guild, url, id, description, name, tags } = sticker;
        if (!guild)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'stickers');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/stickers#create".');
        const user = await sticker.fetchUser().catch(() => null);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Green')
            .setAuthor({
            name: 'Created sticker',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(user
            ? `**${user.toString()} added a sticker:** ${name}`
            : `**Added a sticker:** ${name}`)
            .addFields({
            name: 'Information',
            value: (0, common_tags_1.stripIndent) `
                **Related emoji:** ${tags || 'None'}
                **Description:** ${description || 'No description.'}
                `,
        })
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('stickerDelete', async (sticker) => {
        const { guild, url, id, description, name, tags } = sticker;
        if (!guild)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'stickers');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/stickers#delete".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted sticker',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Name:** ${name}
                **Related emoji:** ${tags || 'None'}
                **Description:** ${description || 'No description.'}
            `)
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('stickerUpdate', async (oldSticker, newSticker) => {
        const { guild, url, id } = newSticker;
        if (!guild)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'stickers');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/sticker#update".');
        const { name: name1, description: description1, tags: tags1 } = oldSticker;
        const { name: name2, description: description2, tags: tags2 } = newSticker;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated sticker',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp();
        if (name1 !== name2)
            embed.addFields({
                name: 'Name',
                value: `${name1} ➜ ${name2}`,
            });
        if (description1 !== description2)
            embed.addFields({
                name: 'Description',
                value: (0, common_tags_1.stripIndent) `
            **Before**
            ${description1 || 'No description.'}
            **After**
            ${description2 || 'No description.'}
            `,
            });
        if (tags1 !== tags2)
            embed.addFields({
                name: 'Related emoji',
                value: `${tags1 || 'None'} ➜ ${tags2 || 'None'}`,
            });
        if (embed.data.fields?.length !== 0)
            guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2tlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL3N0aWNrZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwQztBQUUxQyx1Q0FBbUQ7QUFFbkQsdUNBQXVDO0FBQ3ZDLG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7UUFDdkMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzVELElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUVuQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztRQUU5RCxNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFekQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDakIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELGNBQWMsQ0FBQyxJQUFJO1lBQ2hCLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsdUJBQXVCLElBQUksRUFBRTtZ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