import { stripIndent } from 'common-tags';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled, basicEmbed, generateDocId } from '../../utils';

const antiScamRegex = new RegExp(
    'https?://((?:www\\.)?' // url prefix
    + `(?:${[
        'discordgifts?',
        'discordn',
        'discordi',
        'dlscord-app',
        'dlscord',
        'discordd',
        'dlscorcl',
        'discordsnitro',
        'discordnitro',
        'steamcommunityx',
        'discord-nitro',
        'steamcommuniuty',
        'discrod-gifte',
        'discocrd',
        'discorid',
        'steam-dlscord',
        'steam-discord',
        'discord-nltro',
        'dlscordapp',
        'discrod',
        'discrodsteam',
        'discordc',
        'discocrd-gift',
        'disccord',
        'discord-app',
    ].join('|')})\\.` // site name
    + `(?:${[
        'com', 'gg', 'gifts?', 'info', 'birth', 'co\\.uk', 'help', 'l?ink', 'pro', 'click', 'ru\\.com', 'ru', 'org',
    ].join('|')}))/?`, // url suffix
    'mi'
);

const officialSitesRegex = new RegExp(
    '^discordapp\\.com|discordapp\\.net|discord\\.com|discord\\.new|discord\\.gift|discord\\.gifts|'
    + 'discord\\.media|discord\\.gg|discord\\.co|discord\\.app|dis\\.gd|cdn\\.discordapp\\.com$',
    'i'
);

/** This module manages the chat filter. */
export default function (client: CommandoClient<true>): void {
    client.on('messageCreate', async message => {
        if (!message.inGuild()) return;

        const { guild, author, content, guildId, embeds, member } = message;
        if (!guild || !member?.bannable) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'scam-detector' as 'welcome');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "modules/scam-detector".');

        const string = content + embeds.map(embed =>
            (embed.description ?? '') + embed.fields.map(field => field.value)
        ) || null;
        if (!string) return;

        const match = string.match(antiScamRegex)?.[1] ?? null;
        if (!match) return;

        const isOfficialSite = officialSitesRegex.test(match);
        if (isOfficialSite) return;

        const reason = 'Possible scam or malicious link.';
        const mod = client.user;

        if (!author.bot) await author.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been banned from ${guild.name}`,
                fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Scam detection system]
                `,
            })],
        }).catch(() => null);

        await message.delete().catch(() => null);
        await member.ban({ reason });

        await guild.database.moderations.add({
            _id: generateDocId(),
            type: 'ban',
            guild: guildId,
            userId: author.id,
            userTag: author.tag,
            modId: mod.id,
            modTag: mod.tag,
            reason,
        });
    });
}
