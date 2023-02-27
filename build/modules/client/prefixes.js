"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Applies all saved prefixes in all servers. */
async function default_1(client) {
    const { database } = client;
    const guilds = client.guilds.cache.toJSON();
    const global = await database.prefixes.fetch();
    if (global)
        client.prefix = global.prefix;
    for (const guild of guilds) {
        const data = await guild.database.prefixes.fetch();
        if (data)
            guild.prefix = data.prefix;
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9jbGllbnQvcHJlZml4ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxpREFBaUQ7QUFDbEMsS0FBSyxvQkFBVyxNQUE0QjtJQUN2RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDO0lBQzVCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBRTVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMvQyxJQUFJLE1BQU07UUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFMUMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDeEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuRCxJQUFJLElBQUk7WUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDeEM7QUFDTCxDQUFDO0FBWEQsNEJBV0MifQ==