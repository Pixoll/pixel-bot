import { CommandoClient } from 'pixoll-commando';
import { fetchPartial, isGuildModuleEnabled } from '../../utils/functions';

/** Handles sticky roles for joining/leaving members. */
export default function (client: CommandoClient<true>): void {
    const botId = client.user.id;

    client.on('guildMemberAdd', async member => {
        const { guild, roles, id } = member;
        if (id === botId) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'sticky-roles');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "modules/sticky-roles#guildMemberAdd".');

        const rolesData = await guild.database.stickyRoles.fetch({ user: id });
        if (!rolesData) return;

        for (const role of rolesData.roles) await roles.add(role).catch(() => null);
    });

    client.on('guildMemberRemove', async partialMember => {
        const member = await fetchPartial(partialMember);
        if (!member) return;

        const { guild, id, roles } = member;
        if (id === botId || !guild.available) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'sticky-roles');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "modules/sticky-roles#guildMemberRemove".');

        const { setup, stickyRoles } = guild.database;
        const data = await setup.fetch();

        const rolesArray = roles.cache.filter(role => {
            if (role.id === guild.id) return false;
            if (guild.members.me && guild.members.me.roles.highest.comparePositionTo(role) < 1) return false;
            if ([data?.memberRole, data?.botRole].includes(role.id)) return false;
            return true;
        });

        await stickyRoles.add({
            guild: guild.id,
            user: id,
            roles: rolesArray.map(r => r.id),
        });
    });
}
