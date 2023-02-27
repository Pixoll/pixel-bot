"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Handles default roles for new members. */
function default_1(client) {
    client.on('guildMemberAdd', async (member) => {
        const { guild, user, roles, id } = member;
        if (id === client.user.id)
            return;
        const data = await guild.database.setup.fetch();
        if (!data)
            return;
        client.emit('debug', 'Running event "modules/default-roles".');
        if (data.memberRole && !user.bot)
            await roles.add(data.memberRole).catch(() => null);
        if (data.botRole && user.bot)
            await roles.add(data.botRole).catch(() => null);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1yb2xlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL21pc2MvZGVmYXVsdC1yb2xlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDZDQUE2QztBQUM3QyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUMsTUFBTSxFQUFDLEVBQUU7UUFDdkMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUMxQyxJQUFJLEVBQUUsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPO1FBRWxDLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHdDQUF3QyxDQUFDLENBQUM7UUFFL0QsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFBRSxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUc7WUFBRSxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFiRCw0QkFhQyJ9