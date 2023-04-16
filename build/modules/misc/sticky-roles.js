"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
/** Handles sticky roles for joining/leaving members. */
function default_1(client) {
    const botId = client.user.id;
    client.on('guildMemberAdd', async (member) => {
        const { guild, roles, id } = member;
        if (id === botId)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'sticky-roles');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "modules/sticky-roles#guildMemberAdd".');
        const rolesData = await guild.database.stickyRoles.fetch({ user: id });
        if (!rolesData)
            return;
        for (const role of rolesData.roles)
            await roles.add(role).catch(() => null);
    });
    client.on('guildMemberRemove', async (partialMember) => {
        const member = await (0, utils_1.fetchPartial)(partialMember);
        if (!member)
            return;
        const { guild, id, roles } = member;
        if (id === botId || !guild.available)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'sticky-roles');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "modules/sticky-roles#guildMemberRemove".');
        const { setup, stickyRoles } = guild.database;
        const data = await setup.fetch();
        const rolesArray = roles.cache.filter(role => {
            if (role.id === guild.id)
                return false;
            if (guild.members.me && guild.members.me.roles.highest.comparePositionTo(role) < 1)
                return false;
            if ([data?.memberRole, data?.botRole].includes(role.id))
                return false;
            return true;
        });
        await stickyRoles.add({
            guild: guild.id,
            user: id,
            roles: rolesArray.map(r => r.id),
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5LXJvbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbWlzYy9zdGlja3ktcm9sZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBaUU7QUFFakUsd0RBQXdEO0FBQ3hELG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUU3QixNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtRQUN2QyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDcEMsSUFBSSxFQUFFLEtBQUssS0FBSztZQUFFLE9BQU87UUFFekIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsc0RBQXNELENBQUMsQ0FBQztRQUU3RSxNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxLQUFLO1lBQUUsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxFQUFDLGFBQWEsRUFBQyxFQUFFO1FBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxvQkFBWSxFQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUVwQixNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDcEMsSUFBSSxFQUFFLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRTdDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSw0QkFBb0IsRUFBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHlEQUF5RCxDQUFDLENBQUM7UUFFaEYsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBQzlDLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWpDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pDLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUN2QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUNqRyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDdEUsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsQ0FBQyxHQUFHLENBQUM7WUFDbEIsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ2YsSUFBSSxFQUFFLEVBQUU7WUFDUixLQUFLLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDbkMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBOUNELDRCQThDQyJ9