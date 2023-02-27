import { CommandoClient } from 'pixoll-commando';

/** Disables all saved modules in all servers. */
export default async function (client: CommandoClient<true>): Promise<void> {
    const { database, registry } = client;
    const guilds = client.guilds.cache.toJSON();

    const globalData = await database.disabled.fetch();
    if (globalData) {
        for (const name of globalData.commands) {
            const command = registry.resolveCommand(name);
            command.setEnabledIn(null, false);
        }
        for (const name of globalData.groups) {
            const group = registry.resolveGroup(name);
            group.setEnabledIn(null, false);
        }
    }

    for (const guild of guilds) {
        const data = await guild.database.disabled.fetch();
        if (!data) continue;
        for (const name of data.commands) {
            const command = registry.resolveCommand(name);
            if (command) command.setEnabledIn(guild, false);
        }
        for (const name of data.groups) {
            const group = registry.resolveGroup(name);
            if (group) group.setEnabledIn(guild, false);
        }
    }
}
