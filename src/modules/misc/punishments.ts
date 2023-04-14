import { ActiveSchema, CommandoClient, CommandoGuild, CommandoGuildManager, JSONIfySchema } from 'pixoll-commando';

/** This module manages expired punishments. */
export default async function (client: CommandoClient<true>): Promise<void> {
    await checkPunishments(client);
}

async function checkPunishments(client: CommandoClient<true>): Promise<void> {
    const guilds = (client.guilds as unknown as CommandoGuildManager).cache.toJSON();
    for (const guild of guilds) {
        const db = guild.database.active;

        const docs = await db.fetchMany({ duration: { $lte: Date.now() } });
        for (const doc of docs.toJSON()) {
            client.emit('debug', 'Running event "modules/punishments#expired".');
            await handlePunishment(doc, client, guild);
        }

        await Promise.all(docs.map(doc => db.delete(doc)));
    }

    setTimeout(async () => await checkPunishments(client), 1000);
}

async function handlePunishment(
    doc: JSONIfySchema<ActiveSchema>, client: CommandoClient<true>, guild: CommandoGuild
): Promise<void> {
    const { users } = client;
    const { members, bans, database } = guild;

    const user = await users.fetch(doc.userId).catch(() => null);
    if (!user) return;

    if (doc.type === 'temp-ban') {
        const ban = await bans.fetch(user).catch(() => null);
        if (!ban) return;

        await members.unban(user, 'Ban has expired.');
        return;
    }

    const member = await members.fetch(user.id).catch(() => null);
    if (!member) return;
    const data = await database.setup.fetch();

    if (doc.type === 'mute') {
        if (!data || !data.mutedRole) return;
        if (member.roles.cache.has(data.mutedRole)) {
            await member.roles.remove(data.mutedRole);
            client.emit('guildMemberUnmute', guild, client.user, user, 'Mute has expired.');
        }
        return;
    }

    if (doc.type === 'temp-role' && doc.role) {
        if (!member.roles.cache.has(doc.role)) return;
        await member.roles.remove(doc.role);
    }
}
