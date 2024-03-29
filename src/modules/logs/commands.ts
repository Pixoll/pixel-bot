import { oneLine } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled, limitStringLength, codeBlock, hyperlink } from '../../utils';

/** Handles all of the command logs. */
export default function (client: CommandoClient<true>): void {
    client.on('commandRun', async (command, _, context) => {
        if (!context.inGuild()) return;

        const { guild, channel, author } = context;
        const isModCommand = !!command.userPermissions
            || command.ownerOnly
            || command.guildOwnerOnly
            || command.name === 'prefix'
            || command.modPermissions;

        if (command.hidden || !isModCommand) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'commands');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/commands#run".');

        const url = context.isMessage() ? context.url
            : await context.fetchReply().catch(() => null).then(m => m?.url);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: `Used ${command.name} command`,
                iconURL: author.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(oneLine`
                ${author.toString()} used the \`${command.name}\` command in ${channel.toString()}
                ${url ? hyperlink('Jump to message', url) : ''}
            `)
            .addFields({
                name: 'Message',
                value: limitStringLength(codeBlock(context.toString()), 1024),
            })
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('commandPrefixChange', async (guild, prefix) => {
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'commands');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/commands#prefixChange".');

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated command prefix',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(`**New prefix:** ${prefix}`)
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('commandStatusChange', async (guild, command, enabled) => {
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'commands');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/commands#statusChange".');

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated command status',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(`The \`${command.name}\` command has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });
}
