"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
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
        const roleId = pixoll_commando_1.Util.lastFromArray(customId.split(/:/g));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXJvbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbWlzYy9idXR0b24tcm9sZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBdUQ7QUFFdkQsd0NBQXdDO0FBQ3pCLEtBQUssb0JBQVcsTUFBNEI7SUFDdkQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUMsV0FBVyxFQUFDLEVBQUU7UUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUU7WUFBRSxPQUFPO1FBQ3BDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxXQUFXLENBQUM7UUFDekQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksT0FBTyxFQUFFLFNBQVMsRUFBRTtZQUFFLE9BQU87UUFFN0YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztRQUU5RCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLHNCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4RCxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFFckQsTUFBTSxPQUFPLEdBQUcsT0FBTztZQUNuQixDQUFDLENBQUMsTUFBTSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3RFLENBQUMsQ0FBQyxNQUFNLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4RSxNQUFNLE9BQU8sR0FBRyxPQUFPO1lBQ25CLENBQUMsQ0FBQyxlQUFlLE1BQU0sVUFBVSxJQUFJLEVBQUUsSUFBSSxVQUFVO1lBQ3JELENBQUMsQ0FBQyx1RUFBdUUsQ0FBQztRQUU5RSxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBeEJELDRCQXdCQyJ9