import { CommandoClient } from 'pixoll-commando';

/** Handles default roles for new members. */
export default function (client: CommandoClient<true>): void {
    client.on('guildMemberAdd', async member => {
        const { guild, user, roles, id } = member;
        if (id === client.user.id) return;

        const data = await guild.database.setup.fetch();
        if (!data) return;

        client.emit('debug', 'Running event "modules/default-roles".');

        if (data.memberRole && !user.bot) await roles.add(data.memberRole).catch(() => null);
        if (data.botRole && user.bot) await roles.add(data.botRole).catch(() => null);
    });
}
