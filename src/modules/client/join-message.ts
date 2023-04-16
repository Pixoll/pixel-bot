import { oneLine, stripIndent } from 'common-tags';
import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { customEmoji, hyperlink, pixelColor, privacyPolicyUrl, termsOfServiceUrl, topggUrl } from '../../utils';

/** Sends a message when the bot joins a guild. */
export default async function (client: CommandoClient<true>): Promise<void> {
    client.on('commandoGuildCreate', async guild => {
        client.emit('debug', 'Running "client/join-message".');

        const { user, owners, prefix, options } = client;
        const { channels, id } = guild;

        const owner = owners?.[0];
        if (!owner) return;

        const channel = channels.cache
            .filter((channel): channel is TextChannel => {
                if (channel.type !== ChannelType.GuildText) return false;
                const everyonePerms = channel.permissionOverwrites.resolve(id)?.allow;
                if (!everyonePerms) return false;
                const hasPermissions = everyonePerms.bitfield === 0n
                    || everyonePerms.has(['SendMessages', 'ViewChannel']);
                return hasPermissions;
            })
            .sort((a, b) => a.rawPosition - b.rawPosition)
            .first()
            ?? await guild.fetchOwner().catch(() => null).then(m =>
                m?.user.createDM().catch(() => null)
            );

        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(pixelColor)
            .setTitle(`Thanks for adding ${user.username}!`)
            .setDescription('Here\'s some useful information about the bot.')
            .addFields({
                name: `${customEmoji('info')} Using commands`,
                value: stripIndent`
                To use a command type \`${prefix}<command>\`, \`/<command>\` or \`@${user.tag} <command>\`!
                For a list of all commands or general information, run \`/help\`.

                ${oneLine`
                *Note: Slash commands should be your preference from now on, as prefixed commands will be
                deprecated on the upcoming months.*
                `}
                `,
            }, {
                name: '⚙ Setting up the bot',
                value: stripIndent`
                ${oneLine`
                To setup the bot just run \`/setup\`, this will setup every core setting for all modules of
                the bot. If you want to setup an specific module, just run \`/setup [module]\`, you can see
                the full list using \`/help setup\`.
                `}
                ${oneLine`
                Afterwards, make sure to run \`/module toggle\` to toggle the modules/sub-modules you want to use
                in this server.
                `}

                ${oneLine`
                *Note: All modules/sub-modules are disabled by default.
                Setup data will be deleted if the bot leaves the server.*
                `}
                `,
            }, {
                name: '🕒 Note about times and dates',
                value: oneLine`
                The bot runs based off the **Coordinated Universal Time (UTC).** This means that when you used
                time-based commands, like \`timestamp\`, \`reminder\` or \`time\`, all of the times you specify
                will be based on UTC's time. For more information about the time system, please check **page 4**
                of the \`help\` command.
                `,
            }, {
                name: '🔗 Useful links',
                value: stripIndent`
                ${hyperlink('Privacy Policy', privacyPolicyUrl)} -
                ${hyperlink('Terms of Service', termsOfServiceUrl)} -
                ${hyperlink('Top.gg page', topggUrl)} -
                ${hyperlink('Support server', options.serverInvite ?? '')} -
                ${hyperlink('Invite the bot', topggUrl + '/invite')} -
                ${hyperlink('Vote here', topggUrl + '/vote')}
                `,
            })
            .setFooter({
                text: `Created with ❤️ by ${owner.tag}`,
                iconURL: owner.displayAvatarURL({ forceStatic: false }),
            });

        await channel.send({ embeds: [embed] }).catch(() => null);
    });
}
