"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param link The link of the image
 */
function imageLink(link) {
    if (link)
        return (0, utils_1.hyperlink)('Click here', link);
    return 'None';
}
/** Handles all of the member logs. */
function default_1(client) {
    client.on('userUpdate', async (oldUser, newUser) => {
        const { username: name1, discriminator: discrim1, avatar: avatar1, flags: flags1 } = oldUser;
        const { username: name2, discriminator: discrim2, avatar: avatar2, flags: flags2, id, tag } = newUser;
        const userType = newUser.bot ? 'bot' : 'user';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: `Updated ${userType}`,
            iconURL: newUser.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`${newUser.toString()} ${tag}`)
            .setFooter({ text: `${pixoll_commando_1.Util.capitalize(userType)} ID: ${id}` })
            .setTimestamp();
        if (name1 !== name2)
            embed.addFields({
                name: 'Username',
                value: `${name1} ➜ ${name2}`,
            });
        if (discrim1 !== discrim2)
            embed.addFields({
                name: 'Discriminator',
                value: `${discrim1} ➜ ${discrim2}`,
            });
        if (avatar1 !== avatar2)
            embed.addFields({
                name: 'Avatar',
                value: (0, common_tags_1.stripIndent) `
            **Before:** ${imageLink(oldUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            **After:** ${imageLink(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            `,
            }).setThumbnail(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }));
        if (flags1 !== flags2) {
            const array1 = pixoll_commando_1.Util.filterNullishItems(flags1?.toArray().map(flag => utils_1.userFlagToEmojiMap[flag]) || []);
            const array2 = pixoll_commando_1.Util.filterNullishItems(flags2?.toArray().map(flag => utils_1.userFlagToEmojiMap[flag]) || []);
            const [added, removed] = (0, utils_1.compareArrays)(array1, array2).map(arr => arr.filter(e => e));
            if (added.length !== 0)
                embed.addFields({
                    name: `${(0, utils_1.customEmoji)('check')} Added badges`,
                    value: added.join(', '),
                });
            if (removed.length !== 0)
                embed.addFields({
                    name: `${(0, utils_1.customEmoji)('cross')} Removed badges`,
                    value: removed.join(', '),
                });
        }
        if (embed.data.fields?.length === 0)
            return;
        const guilds = client.guilds.cache.toJSON();
        for (const guild of guilds) {
            const member = guild.members.cache.get(id);
            if (!member)
                continue;
            const status = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'users');
            if (!status)
                continue;
            guild.queuedLogs.push(embed);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL3VzZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwQztBQUMxQyxxREFBNkU7QUFDN0UsdUNBQThHO0FBRTlHOzs7R0FHRztBQUNILFNBQVMsU0FBUyxDQUFDLElBQW1CO0lBQ2xDLElBQUksSUFBSTtRQUFFLE9BQU8sSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvQyxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsc0NBQXNDO0FBQ3RDLG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQy9DLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzdGLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDdEcsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFFOUMsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDaEIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLFdBQVcsUUFBUSxFQUFFO1lBQzNCLE9BQU8sRUFBRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FB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