import { prettyMs } from 'better-ms';
import { stripIndent } from 'common-tags';
import { EmbedBuilder, version as djsVersion } from 'discord.js';
import { Command, CommandContext, CommandoClient, version as pixComVersion } from 'pixoll-commando';
import { reply, hyperlink, pixelColor, topggUrl, privacyPolicyUrl, termsOfServiceUrl, githubUrl } from '../../utils';

declare function require<T>(id: string): T;
const { version, description } = require<{ version: string; description: string }>('../../../package.json');
const djsDocsUrl = `https://discord.js.org/#/docs/discord.js/${djsVersion}/general/welcome`;

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
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString();

        const info = new EmbedBuilder()
            .setColor(pixelColor)
            .setTitle(`About ${user.username}`)
            .setDescription(stripIndent`
                **Serving ${users} users across ${guilds.size} servers!**
                ${description}
            `)
            .addFields({
                name: 'Information',
                value: stripIndent`
                **Version:** ${version}
                **GitHub Repository:** ${githubUrl}
                **Library:** ${hyperlink('discord.js v' + djsVersion, djsDocsUrl)}
                **Framework:** ${hyperlink('pixoll-commando v' + pixComVersion, 'https://github.com/Pixoll/pixoll-commando')}
                **Developer:** ${owners?.[0].toString()} (${owners?.[0].tag})
                `,
                inline: true,
            }, {
                name: 'Links',
                value: stripIndent`
                • ${hyperlink('Privacy Policy', privacyPolicyUrl)}
                • ${hyperlink('Terms of Service', termsOfServiceUrl)}
                • ${hyperlink('Top.gg page', topggUrl)}
                • ${hyperlink('Support server', options.serverInvite ?? '')}
                • ${hyperlink('Invite the bot', topggUrl + '/invite')}
                • ${hyperlink('Vote here', topggUrl + '/vote')}
                `,
                inline: true,
            })
            .setFooter({ text: `Uptime: ${uptimeStr}` })
            .setTimestamp();

        await reply(context, info);
    }
}
