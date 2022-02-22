/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
const { isModuleEnabled, timestamp, customEmoji } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/**
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 */
function imageLink(link) {
    if (link) return `[Click here](${link})`;
    return 'None';
}

/**
 * Handles all of the member logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async member => {
        const { guild, user } = member;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'members');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/members#add".');

        const { tag, id, createdAt } = user;

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor({
                name: 'User joined', iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Registered', timestamp(createdAt, 'R'))
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);

        // if (Date.now() - createdTimestamp < myMs('3d')) {
        //     const autoMod = await isModuleEnabled(guild, 'audit-logs', 'autoMod')
        //     if (!autoMod) return

        //     return await ban(guild, client, user, 'Account is too young, possible raid threat.')
        // }
    });

    client.on('guildMemberRemove', async member => {
        if (member.partial) {
            member = await member.fetch().catch(() => null);
            if (!member) return;
        }

        const { guild, user, roles, id } = member;
        if (!guild.available || id === client.user.id) return;

        const status = await isModuleEnabled(guild, 'audit-logs', 'members');
        if (!status) return;

        client.emit('debug', 'Running event "logs/members#remove".');

        const { tag } = user;

        const rolesList = roles.cache.filter(r => r.id !== guild.id)
            .sort((a, b) => b.position - a.position).toJSON().join(' ');

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: 'User left', iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Roles', rolesList || 'None')
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const { guild } = newMember;
        if (!guild.available) return;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'members');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/members#update".');

        const { roles: roles1, nickname: nick1, avatar: avatar1 } = oldMember;
        const { roles: roles2, nickname: nick2, avatar: avatar2, user, id } = newMember;

        const role = roles1.cache.difference(roles2.cache).first();

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated member', iconURL: newMember.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();

        if (nick1 !== nick2) embed.addField('Nickname', `${nick1 || 'None'} ➜ ${nick2 || 'None'}`);

        if (avatar1 !== avatar2) {
            embed.addField('Server avatar', stripIndent`
                **Before:** ${imageLink(oldMember.displayAvatarURL({ dynamic: true, size: 2048 }))}
                **After:** ${imageLink(newMember.displayAvatarURL({ dynamic: true, size: 2048 }))}
            `).setThumbnail(newMember.displayAvatarURL({ dynamic: true, size: 2048 }));
        }

        if (role) {
            const action = roles2.cache.has(role.id) ? 'Added' : 'Removed';
            const emoji = customEmoji(action === 'Added' ? 'check' : 'cross');
            embed.addField(`${emoji} ${action} role`, `${role.toString()}`);
        }

        if (embed.fields.length !== 0) guild.queuedLogs.push(embed);
    });
};