import { prettyMs } from 'better-ms';
import { stripIndent } from 'common-tags';
import { EmbedBuilder, version as djsVersion } from 'discord.js';
import { Command, CommandContext, CommandoClient, version as pixComVersion } from 'pixoll-commando';
import { replyAll, hyperlink } from '../../utils';

declare function require<T>(id: string): T;
const { version, description } = require<{ version: string; description: string }>('../../../package.json');

export default class InfoCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'info',
            aliases: ['about'],
            group: 'info',
            description: 'Displays some information about the bot.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const { client } = context;
        const { user, owners, options, uptime } = client;
        const guilds = client.guilds.cache;

        const uptimeStr = prettyMs(uptime, { verbose: true, unitCount: 2 });
        const topgg = 'https://top.gg/bot/802267523058761759';
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString();

        const info = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setTitle(`About ${user.username}`)
            .setDescription(stripIndent`
                **Serving ${users} users across ${guilds.size} servers!**
                ${description}
            `)
            .addFields({
                name: 'Information',
                value: stripIndent`
                **Version:** ${version}
                **Library:** ${hyperlink('discord.js v' + djsVersion, 'https://discord.js.org/#/')}
                **Framework:** ${hyperlink('pixoll-commando v' + pixComVersion, 'https://github.com/Pixoll/pixoll-commando')}
                **Developer:** ${owners?.[0].toString()} (${owners?.[0].tag})
                `,
                inline: true,
            }, {
                name: 'Links',
                value: stripIndent`
                • ${hyperlink('Top.gg page', topgg)}
                • ${hyperlink('Support server', options.serverInvite ?? '')}
                • ${hyperlink('Invite the bot', topgg + '/invite')}
                • ${hyperlink('Vote here', topgg + '/vote')}
                `,
                inline: true,
            })
            .setFooter({ text: `Uptime: ${uptimeStr}` })
            .setTimestamp();

        await replyAll(context, info);
    }
}
