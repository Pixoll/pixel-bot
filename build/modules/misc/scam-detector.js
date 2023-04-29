"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const utils_1 = require("../../utils");
const antiScamRegex = new RegExp('https?://((?:www\\.)?' // url prefix
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
'mi');
const officialSitesRegex = new RegExp('^discordapp\\.com|discordapp\\.net|discord\\.com|discord\\.new|discord\\.gift|discord\\.gifts|'
    + 'discord\\.media|discord\\.gg|discord\\.co|discord\\.app|dis\\.gd|cdn\\.discordapp\\.com$', 'i');
/** This module manages the chat filter. */
function default_1(client) {
    client.on('messageCreate', async (message) => {
        if (!message.inGuild())
            return;
        const { guild, author, content, guildId, embeds, member } = message;
        if (!guild || !member?.bannable)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'scam-detector');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "modules/scam-detector".');
        const string = content + embeds.map(embed => (embed.description ?? '') + embed.fields.map(field => field.value)) || null;
        if (!string)
            return;
        const match = string.match(antiScamRegex)?.[1] ?? null;
        if (!match)
            return;
        const isOfficialSite = officialSitesRegex.test(match);
        if (isOfficialSite)
            return;
        const reason = 'Possible scam or malicious link.';
        const mod = client.user;
        if (!author.bot)
            await author.send({
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        fieldName: `You have been banned from ${guild.name}`,
                        fieldValue: (0, common_tags_1.stripIndent) `
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Scam detection system]
                `,
                    })],
            }).catch(() => null);
        await message.delete().catch(() => null);
        await member.ban({ reason });
        await guild.database.moderations.add({
            _id: (0, utils_1.generateDocId)(),
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
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhbS1kZXRlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL21pc2Mvc2NhbS1kZXRlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUUxQyx1Q0FBOEU7QUFFOUUsTUFBTSxhQUFhLEdBQUcsSUFBSSxNQUFNLENBQzVCLHVCQUF1QixDQUFDLGFBQWE7TUFDbkMsTUFBTTtRQUNKLGVBQWU7UUFDZixVQUFVO1FBQ1YsVUFBVTtRQUNWLGFBQWE7UUFDYixTQUFTO1FBQ1QsVUFBVTtRQUNWLFVBQVU7UUFDVixlQUFlO1FBQ2YsY0FBYztRQUNkLGlCQUFpQjtRQUNqQixlQUFlO1FBQ2YsaUJBQWlCO1FBQ2pCLGVBQWU7UUFDZixVQUFVO1FBQ1YsVUFBVTtRQUNWLGVBQWU7UUFDZixlQUFlO1FBQ2YsZUFBZTtRQUNmLFlBQVk7UUFDWixTQUFTO1FBQ1QsY0FBYztRQUNkLFVBQVU7UUFDVixlQUFlO1FBQ2YsVUFBVTtRQUNWLGFBQWE7S0FDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZO01BQzVCLE1BQU07UUFDSixLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLO0tBQzlHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsYUFBYTtBQUNoQyxJQUFJLENBQ1AsQ0FBQztBQUVGLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxNQUFNLENBQ2pDLGdHQUFnRztNQUM5RiwwRkFBMEYsRUFDNUYsR0FBRyxDQUNOLENBQUM7QUFFRiwyQ0FBMkM7QUFDM0MsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBQyxPQUFPLEVB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