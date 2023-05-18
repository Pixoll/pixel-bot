"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** This module manages button roles. */
async function default_1(client) {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton())
            return;
        const { customId, channel, member, guild } = interaction;
        if (!guild || !member || !customId.startsWith('button-role') || channel?.isDMBased())
            return;
        client.emit('debug', 'Running event "modules/button-roles".');
        const memberRoles = member.roles;
        const roleId = customId.split(/:/g).at(-1);
        if (!roleId)
            return;
        const role = await guild.roles.fetch(roleId);
        const hasRole = memberRoles.cache.has(roleId);
        const action = hasRole ? 'removed from' : 'added to';
        const toggled = hasRole
            ? await memberRoles.remove(roleId).then(() => true).catch(() => false)
            : await memberRoles.add(roleId).then(() => true).catch(() => false);
        const content = toggled
            ? `You've been ${action} the \`${role?.name}\` role.`
            : 'An unexpected error occurred, please contact an admin in this server.';
        await interaction.reply({ content, ephemeral: true });
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXJvbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbWlzYy9idXR0b24tcm9sZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSx3Q0FBd0M7QUFDekIsS0FBSyxvQkFBVyxNQUE0QjtJQUN2RCxNQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBQyxXQUFXLEVBQUMsRUFBRTtRQUMvQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUFFLE9BQU87UUFDcEMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUN6RCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxPQUFPLEVBQUUsU0FBUyxFQUFFO1lBQUUsT0FBTztRQUU3RixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1FBRTlELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU87UUFDcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1FBRXJELE1BQU0sT0FBTyxHQUFHLE9BQU87WUFDbkIsQ0FBQyxDQUFDLE1BQU0sV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN0RSxDQUFDLENBQUMsTUFBTSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFeEUsTUFBTSxPQUFPLEdBQUcsT0FBTztZQUNuQixDQUFDLENBQUMsZUFBZSxNQUFNLFVBQVUsSUFBSSxFQUFFLElBQUksVUFBVTtZQUNyRCxDQUFDLENBQUMsdUVBQXVFLENBQUM7UUFFOUUsTUFBTSxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQXpCRCw0QkF5QkMifQ==