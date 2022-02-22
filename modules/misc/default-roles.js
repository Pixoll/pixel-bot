/* eslint-disable no-unused-vars */
const { CommandoClient, CommandoMember } = require('pixoll-commando');
/* eslint-enable no-unused-vars */

/**
 * Handles default roles for new members.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', /** @param {CommandoMember} member */ async member => {
        const { guild, user, roles, id } = member;
        if (id === client.user.id) return;

        const data = await guild.database.setup.fetch();
        if (!data) return;

        client.emit('debug', 'Running event "modules/default-roles".');

        if (data.memberRole && !user.bot) await roles.add(data.memberRole).catch(() => null);
        if (data.botRole && user.bot) await roles.add(data.botRole).catch(() => null);
    });
};