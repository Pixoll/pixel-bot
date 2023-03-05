"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param The link of the image
 */
function imageLink(link) {
    if (link)
        return (0, utils_1.hyperlink)('Click here', link);
    return 'None';
}
/** Handles all of the member logs. */
function default_1(client) {
    client.on('guildMemberAdd', async (member) => {
        const { guild, user } = member;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'members');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/members#add".');
        const { tag, id, createdAt } = user;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Green')
            .setAuthor({
            name: 'User joined',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addFields({
            name: 'Registered',
            value: (0, utils_1.timestamp)(createdAt, 'R'),
        })
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
        // if (Date.now() - createdTimestamp < myMs('3d')) {
        //     const autoMod = await isGuildModuleEnabled(guild, 'audit-logs', 'autoMod')
        //     if (!autoMod) return
        //     return await ban(guild, client, user, 'Account is too young, possible raid threat.')
        // }
    });
    client.on('guildMemberRemove', async (partialMember) => {
        const member = await (0, utils_1.fetchPartial)(partialMember);
        if (!member)
            return;
        const { guild, user, roles, id } = member;
        if (!guild.available || id === client.user.id)
            return;
        const status = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'members');
        if (!status)
            return;
        client.emit('debug', 'Running event "logs/members#remove".');
        const { tag } = user;
        const rolesList = roles.cache.filter(r => r.id !== guild.id)
            .sort((a, b) => b.position - a.position).toJSON().join(' ');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'User left', iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addFields({
            name: 'Roles',
            value: rolesList || 'None',
        })
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const { guild } = newMember;
        if (!guild.available)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'members');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/members#update".');
        const { roles: roles1, nickname: nick1, avatar: avatar1 } = oldMember;
        const { roles: roles2, nickname: nick2, avatar: avatar2, user, id } = newMember;
        const role = roles1.cache.difference(roles2.cache).first();
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated member', iconURL: newMember.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();
        if (nick1 !== nick2)
            embed.addFields({
                name: 'Nickname',
                value: `${nick1 || 'None'} ➜ ${nick2 || 'None'}`,
            });
        if (avatar1 !== avatar2)
            embed
                .addFields({
                name: 'Server avatar',
                value: (0, common_tags_1.stripIndent) `
                **Before:** ${imageLink(oldMember.displayAvatarURL({ forceStatic: false, size: 2048 }))}
                **After:** ${imageLink(newMember.displayAvatarURL({ forceStatic: false, size: 2048 }))}
                `,
            })
                .setThumbnail(newMember.displayAvatarURL({ forceStatic: false, size: 2048 }));
        if (role) {
            const action = roles2.cache.has(role.id) ? 'Added' : 'Removed';
            const emoji = (0, utils_1.customEmoji)(action === 'Added' ? 'check' : 'cross');
            embed.addFields({
                name: `${emoji} ${action} role`,
                value: `${role.toString()}`,
            });
        }
        if (embed.data.fields?.length !== 0)
            guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL2xvZ3MvbWVtYmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBMEM7QUFFMUMsdUNBQW9HO0FBRXBHOzs7R0FHRztBQUNILFNBQVMsU0FBUyxDQUFDLElBQVk7SUFDM0IsSUFBSSxJQUFJO1FBQUUsT0FBTyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxzQ0FBc0M7QUFDdEMsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFDLE1BQU0sRUFBQyxFQUFFO1FBQ3ZDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQy9CLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSw0QkFBb0IsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO1FBRTFELE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVwQyxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLE9BQU8sQ0FBQzthQUNqQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsYUFBYTtZQUNuQixPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3pELENBQUM7YUFDRCxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtB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