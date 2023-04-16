import { stripIndent } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled, timestamp, customEmoji, fetchPartial, hyperlink } from '../../utils';

/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param The link of the image
 */
function imageLink(link: string): string {
    if (link) return hyperlink('Click here', link);
    return 'None';
}

/** Handles all of the member logs. */
export default function (client: CommandoClient<true>): void {
    client.on('guildMemberAdd', async member => {
        const { guild, user } = member;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'members');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/members#add".');

        const { tag, id, createdAt } = user;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: 'User joined',
                iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addFields({
                name: 'Registered',
                value: timestamp(createdAt, 'R'),
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

    client.on('guildMemberRemove', async partialMember => {
        const member = await fetchPartial(partialMember);
        if (!member) return;

        const { guild, user, roles, id } = member;
        if (!guild.available || id === client.user.id) return;

        const status = await isGuildModuleEnabled(guild, 'audit-logs', 'members');
        if (!status) return;

        client.emit('debug', 'Running event "logs/members#remove".');

        const { tag } = user;

        const rolesList = roles.cache.filter(r => r.id !== guild.id)
            .sort((a, b) => b.position - a.position).toJSON().join(' ');

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'User left',
                iconURL: user.displayAvatarURL({ forceStatic: false }),
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
        if (!guild.available) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'members');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/members#update".');

        const { roles: roles1, nickname: nick1, avatar: avatar1 } = oldMember;
        const { roles: roles2, nickname: nick2, avatar: avatar2, user, id } = newMember;

        const role = roles1.cache.difference(roles2.cache).first();

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated member',
                iconURL: newMember.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();

        if (nick1 !== nick2) embed.addFields({
            name: 'Nickname',
            value: `${nick1 || 'None'} ➜ ${nick2 || 'None'}`,
        });

        if (avatar1 !== avatar2) embed
            .addFields({
                name: 'Server avatar',
                value: stripIndent`
                **Before:** ${imageLink(oldMember.displayAvatarURL({ forceStatic: false, size: 2048 }))}
                **After:** ${imageLink(newMember.displayAvatarURL({ forceStatic: false, size: 2048 }))}
                `,
            })
            .setThumbnail(newMember.displayAvatarURL({ forceStatic: false, size: 2048 }));

        if (role) {
            const action = roles2.cache.has(role.id) ? 'Added' : 'Removed';
            const emoji = customEmoji(action === 'Added' ? 'check' : 'cross');
            embed.addFields({
                name: `${emoji} ${action} role`,
                value: `${role.toString()}`,
            });
        }

        if (embed.data.fields?.length !== 0) guild.queuedLogs.push(embed);
    });
}
