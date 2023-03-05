"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/** Handles all of the emoji logs. */
function default_1(client) {
    client.on('emojiCreate', async (emoji) => {
        const { guild, name, id, url } = emoji;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'emojis');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/emojis#create".');
        const author = await emoji.fetchAuthor().catch(() => null);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Green')
            .setAuthor({
            name: 'Created emoji',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(author
            ? `**${author.toString()} added an emoji:** ${name}`
            : `**Added emoji:** ${name}`)
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('emojiDelete', async (emoji) => {
        const { guild, name, id, url } = emoji;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'emojis');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/emojis#delete".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted emoji',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`**Name:** ${name}`)
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
        const { guild, id, url } = oldEmoji;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'emojis');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/emojis#update".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated emoji',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .addFields({
            name: 'Name',
            value: `${oldEmoji.name} ➜ ${newEmoji.name}`,
        })
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbG9ncy9lbW9qaXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBMEM7QUFFMUMsdUNBQW1EO0FBRW5ELHFDQUFxQztBQUNyQyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1FBQ25DLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDdkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7UUFFNUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ2pCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxlQUFlO1lBQ3JCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztTQUM5RCxDQUFDO2FBQ0QsY0FBYyxDQUFDLE1BQU07WUFDbEIsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRSxzQkFBc0IsSUFBSSxFQUFFO1lBQ3BELENBQUMsQ0FBQyxvQkFBb0IsSUFBSSxFQUFFLENBQy9CO2FBQ0EsWUFBWSxDQUFDLEdBQUcsQ0FBQzthQUNqQixT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