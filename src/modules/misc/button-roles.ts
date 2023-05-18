import { CommandoClient } from 'pixoll-commando';

/** This module manages button roles. */
export default async function (client: CommandoClient<true>): Promise<void> {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
        const { customId, channel, member, guild } = interaction;
        if (!guild || !member || !customId.startsWith('button-role') || channel?.isDMBased()) return;

        client.emit('debug', 'Running event "modules/button-roles".');

        const memberRoles = member.roles;
        const roleId = customId.split(/:/g).at(-1);
        if (!roleId) return;
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
