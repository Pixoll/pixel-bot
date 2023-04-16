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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9jbGllbnQvcHJlZml4ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxpREFBaUQ7QUFDbEMsS0FBSyxvQkFBVyxNQUE0QjtJQUN2RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDO0lBQzVCLE1BQU0sTUFBTSxHQUFJLE1BQU0sQ0FBQyxNQUEwQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUVqRixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDL0MsSUFBSSxNQUFNO1FBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBRTFDLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkQsSUFBSSxJQUFJO1lBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3hDO0FBQ0wsQ0FBQztBQVhELDRCQVdDIn0=