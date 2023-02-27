"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Disables all saved modules in all servers. */
async function default_1(client) {
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
        if (!data)
            continue;
        for (const name of data.commands) {
            const command = registry.resolveCommand(name);
            if (command)
                command.setEnabledIn(guild, false);
        }
        for (const name of data.groups) {
            const group = registry.resolveGroup(name);
            if (group)
                group.setEnabledIn(guild, false);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21kcy1ncm91cHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9jbGllbnQvY21kcy1ncm91cHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxpREFBaUQ7QUFDbEMsS0FBSyxvQkFBVyxNQUE0QjtJQUN2RCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUN0QyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUU1QyxNQUFNLFVBQVUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbkQsSUFBSSxVQUFVLEVBQUU7UUFDWixLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsQ0FBQyxRQUFRLEVBQUU7WUFDcEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNyQztRQUNELEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNsQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ25DO0tBQ0o7SUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtRQUN4QixNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxJQUFJO1lBQUUsU0FBUztRQUNwQixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDOUIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QyxJQUFJLE9BQU87Z0JBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbkQ7UUFDRCxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDNUIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxJQUFJLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDL0M7S0FDSjtBQUNMLENBQUM7QUE1QkQsNEJBNEJDIn0=