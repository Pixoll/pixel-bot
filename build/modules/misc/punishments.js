"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** This module manages expired punishments. */
async function default_1(client) {
    await checkPunishments(client);
}
exports.default = default_1;
async function checkPunishments(client) {
    const guilds = client.guilds.cache.toJSON();
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
async function handlePunishment(doc, client, guild) {
    const { users } = client;
    const { members, bans, database } = guild;
    const user = await users.fetch(doc.userId).catch(() => null);
    if (!user)
        return;
    if (doc.type === 'temp-ban') {
        const ban = await bans.fetch(user).catch(() => null);
        if (!ban)
            return;
        await members.unban(user, 'Ban has expired.');
        return;
    }
    const member = await members.fetch(user.id).catch(() => null);
    if (!member)
        return;
    const data = await database.setup.fetch();
    if (doc.type === 'mute') {
        if (!data || !data.mutedRole)
            return;
        if (member.roles.cache.has(data.mutedRole)) {
            await member.roles.remove(data.mutedRole);
            client.emit('guildMemberUnmute', guild, client.user, user, 'Mute has expired.');
        }
        return;
    }
    if (doc.type === 'temp-role' && doc.role) {
        if (!member.roles.cache.has(doc.role))
            return;
        await member.roles.remove(doc.role);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVuaXNobWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9taXNjL3B1bmlzaG1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0NBQStDO0FBQ2hDLEtBQUssb0JBQVcsTUFBNEI7SUFDdkQsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsTUFBNEI7SUFDeEQsTUFBTSxNQUFNLEdBQUksTUFBTSxDQUFDLE1BQTBDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2pGLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRWpDLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEUsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsOENBQThDLENBQUMsQ0FBQztZQUNyRSxNQUFNLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDOUM7UUFFRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3REO0lBRUQsVUFBVSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRUQsS0FBSyxVQUFVLGdCQUFnQixDQUMzQixHQUFnQyxFQUFFLE1BQTRCLEVBQUUsS0FBb0I7SUFFcEYsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUN6QixNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFFMUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0QsSUFBSSxDQUFDLElBQUk7UUFBRSxPQUFPO0lBRWxCLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU87UUFFakIsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzlDLE9BQU87S0FDVjtJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlELElBQUksQ0FBQyxNQUFNO1FBQUUsT0FBTztJQUNwQixNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFMUMsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUNyQixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBQ3JDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN4QyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsT0FBTztLQUNWO0lBRUQsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFdBQVcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztZQUFFLE9BQU87UUFDOUMsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkM7QUFDTCxDQUFDIn0=