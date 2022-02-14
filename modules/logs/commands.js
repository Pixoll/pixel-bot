/* eslint-disable no-unused-vars */
const { oneLine } = require('common-tags');
const { MessageEmbed, CommandInteractionOption } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
const { isModuleEnabled, sliceDots, code } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/**
 * Handles all of the command logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('commandRun', async (command, _, { message, interaction }) => {
        const { guild, channel } = message || interaction;
        const author = message?.author || interaction.user;
        const isModCommand = !!command.userPermissions || command.ownerOnly ||
            command.guildOwnerOnly || command.name === 'prefix' || command.modPermissions;

        if (channel.type === 'DM' || command.hidden || !isModCommand) return;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/commands#run".');

        let string;
        if (message) string = message.cleanContent;
        else {
            string = `/${command.name}`;
            /** @param {CommandInteractionOption} opt */
            function concat(opt) {
                if (opt.name && [undefined, null].includes(opt.value)) string += ` ${opt.name}`;
                else string += ` ${opt.name}: "${opt.value}"`;
                opt.options?.forEach(concat);
            }
            for (const option of interaction.options.data) concat(option);
        }
        const content = sliceDots(string, 1016);

        let url;
        if (message) url = message.url;
        else {
            const msg = await interaction.fetchReply();
            if (msg) url = msg.url;
        }

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: `Used ${command.name} command`, iconURL: author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(oneLine`
                ${author.toString()} used the \`${command.name}\` command in ${channel.toString()}
                ${url ? `[Jump to message](${url})` : ''}
            `)
            .addField('Message', code(content))
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('commandPrefixChange', async (guild, prefix) => {
        if (!guild) return;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/commands#prefixChange".');

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated command prefix', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(`**New prefix:** ${prefix}`)
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('commandStatusChange', async (guild, command, enabled) => {
        if (!guild) return;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/commands#statusChange".');

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated command status', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(`The \`${command.name}\` command has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });
};
