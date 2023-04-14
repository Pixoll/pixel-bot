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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21kcy1ncm91cHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9jbGllbnQvY21kcy1ncm91cHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxpREFBaUQ7QUFDbEMsS0FBSyxvQkFBVyxNQUE0QjtJQUN2RCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUN0QyxNQUFNLE1BQU0sR0FBSSxNQUFNLENBQUMsTUFBMEMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFakYsTUFBTSxVQUFVLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25ELElBQUksVUFBVSxFQUFFO1FBQ1osS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLENBQUMsUUFBUSxFQUFFO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDckM7UUFDRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDbEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNuQztLQUNKO0lBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDeEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuRCxJQUFJLENBQUMsSUFBSTtZQUFFLFNBQVM7UUFDcEIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzlCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBSSxPQUFPO2dCQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ25EO1FBQ0QsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzVCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsSUFBSSxLQUFLO2dCQUFFLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQy9DO0tBQ0o7QUFDTCxDQUFDO0FBNUJELDRCQTRCQyJ9