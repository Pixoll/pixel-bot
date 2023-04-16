import { EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled } from '../../utils';

/** Handles all of the modules logs. */
export default function (client: CommandoClient<true>): void {
    client.on('moduleStatusChange', async (guild, module, enabled) => {
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'modules');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/modules".');

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated module status',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(`The \`${module}\` module has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });
}
