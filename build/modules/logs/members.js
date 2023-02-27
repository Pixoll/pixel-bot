"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param The link of the image
 */
function imageLink(link) {
    if (link)
        return `[Click here](${link})`;
    return 'None';
}
/** Handles all of the member logs. */
function default_1(client) {
    client.on('guildMemberAdd', async (member) => {
        const { guild, user } = member;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'members');
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
            value: (0, functions_1.timestamp)(createdAt, 'R'),
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
        const member = await (0, functions_1.fetchPartial)(partialMember);
        if (!member)
            return;
        const { guild, user, roles, id } = member;
        if (!guild.available || id === client.user.id)
            return;
        const status = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'members');
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
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'members');
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
            const emoji = (0, functions_1.customEmoji)(action === 'Added' ? 'check' : 'cross');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL2xvZ3MvbWVtYmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBMEM7QUFFMUMscURBQW1HO0FBRW5HOzs7R0FHRztBQUNILFNBQVMsU0FBUyxDQUFDLElBQVk7SUFDM0IsSUFBSSxJQUFJO1FBQUUsT0FBTyxnQkFBZ0IsSUFBSSxHQUFHLENBQUM7SUFDekMsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUVELHNDQUFzQztBQUN0QyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUMsTUFBTSxFQUFDLEVBQUU7UUFDdkMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDL0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLGdDQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7UUFFMUQsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXBDLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ2pCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxhQUFhO1lBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDekQsQ0FBQzthQUNELFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJ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