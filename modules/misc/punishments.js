/* eslint-disable no-unused-vars */
const { User, GuildMember } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
/* eslint-enable no-unused-vars */

/**
 * This module manages expired punishments.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function checkPunishments() {
        const { users } = client;
        const guilds = client.guilds.cache.toJSON();

        for (const guild of guilds) {
            const { members, bans, database } = guild;
            const db = database.active;

            const docs = await db.fetchMany({ duration: { $lte: Date.now() } });
            for (const doc of docs.toJSON()) {
                client.emit('debug', 'Running event "modules/punishments#expired".');

                /** @type {User} */
                const user = await users.fetch(doc.userId).catch(() => null);
                if (!user) continue;

                if (doc.type === 'temp-ban') {
                    const ban = await bans.fetch(user).catch(() => null);
                    if (!ban) continue;

                    await members.unban(user, 'Ban has expired.');
                    continue;
                }

                /** @type {GuildMember} */
                const member = await members.fetch(user.id).catch(() => null);
                if (!member) continue;
                const data = await database.setup.fetch();

                if (doc.type === 'mute') {
                    if (!data) continue;
                    if (member.roles.cache.has(data.mutedRole)) {
                        await member.roles.remove(data.mutedRole);
                        client.emit('guildMemberUnmute', guild, client.user, user, 'Mute has expired.');
                    }
                    continue;
                }

                if (doc.type === 'temp-role') {
                    if (!member.roles.cache.has(doc.role)) continue;
                    await member.roles.remove(doc.role);
                }
            }

            for (const doc of docs.toJSON()) {
                await db.delete(doc);
            }
        }

        setTimeout(async () => await checkPunishments(), 1000);
    }

    await checkPunishments();
};
