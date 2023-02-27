import { CommandoClient } from 'pixoll-commando';

/** Applies all saved prefixes in all servers. */
export default async function (client: CommandoClient<true>): Promise<void> {
    const { database } = client;
    const guilds = client.guilds.cache.toJSON();

    const global = await database.prefixes.fetch();
    if (global) client.prefix = global.prefix;

    for (const guild of guilds) {
        const data = await guild.database.prefixes.fetch();
        if (data) guild.prefix = data.prefix;
    }
}
