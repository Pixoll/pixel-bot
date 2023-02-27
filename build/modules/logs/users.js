"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const userFlagToEmojiMap = {
    ActiveDeveloper: null,
    BotHTTPInteractions: null,
    BugHunterLevel1: '<:bug_hunter:894117053714292746>',
    BugHunterLevel2: '<:bug_buster:894117053856878592>',
    CertifiedModerator: null,
    Hypesquad: '<:hypesquad:894113047763898369>',
    HypeSquadOnlineHouse1: '<:bravery:894110822786281532>',
    HypeSquadOnlineHouse2: '<:brilliance:894110822626885663>',
    HypeSquadOnlineHouse3: '<:balance:894110823553855518>',
    Partner: '<:partner:894116243785785344>',
    PremiumEarlySupporter: '<:early_supporter:894117997264896080>',
    Quarantined: null,
    Spammer: null,
    Staff: '<:discord_staff:894115772832546856>',
    TeamPseudoUser: null,
    VerifiedBot: '<:verified_bot1:894251987087016006><:verified_bot2:894251987661647873>',
    VerifiedDeveloper: '<:verified_developer:894117997378142238>',
};
/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param link The link of the image
 */
function imageLink(link) {
    if (link)
        return `[Click here](${link})`;
    return 'None';
}
/** Handles all of the member logs. */
function default_1(client) {
    client.on('userUpdate', async (oldUser, newUser) => {
        const { username: name1, discriminator: discrim1, avatar: avatar1, flags: flags1 } = oldUser;
        const { username: name2, discriminator: discrim2, avatar: avatar2, flags: flags2, id, tag } = newUser;
        const userType = newUser.bot ? 'bot' : 'user';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: `Updated ${userType}`,
            iconURL: newUser.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`${newUser.toString()} ${tag}`)
            .setFooter({ text: `${(0, lodash_1.capitalize)(userType)} ID: ${id}` })
            .setTimestamp();
        if (name1 !== name2)
            embed.addFields({
                name: 'Username',
                value: `${name1} ➜ ${name2}`,
            });
        if (discrim1 !== discrim2)
            embed.addFields({
                name: 'Discriminator',
                value: `${discrim1} ➜ ${discrim2}`,
            });
        if (avatar1 !== avatar2)
            embed.addFields({
                name: 'Avatar',
                value: (0, common_tags_1.stripIndent) `
            **Before:** ${imageLink(oldUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            **After:** ${imageLink(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            `,
            }).setThumbnail(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }));
        if (flags1 !== flags2) {
            const array1 = pixoll_commando_1.Util.filterNullishItems(flags1?.toArray().map(flag => userFlagToEmojiMap[flag]) || []);
            const array2 = pixoll_commando_1.Util.filterNullishItems(flags2?.toArray().map(flag => userFlagToEmojiMap[flag]) || []);
            const [added, removed] = (0, functions_1.compareArrays)(array1, array2).map(arr => arr.filter(e => e));
            if (added.length !== 0)
                embed.addFields({
                    name: `${(0, functions_1.customEmoji)('check')} Added badges`,
                    value: added.join(', '),
                });
            if (removed.length !== 0)
                embed.addFields({
                    name: `${(0, functions_1.customEmoji)('cross')} Removed badges`,
                    value: removed.join(', '),
                });
        }
        if (embed.data.fields?.length === 0)
            return;
        const guilds = client.guilds.cache.toJSON();
        for (const guild of guilds) {
            const member = guild.members.cache.get(id);
            if (!member)
                continue;
            const status = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'users');
            if (!status)
                continue;
            guild.queuedLogs.push(embed);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL3VzZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEyRDtBQUMzRCxtQ0FBb0M7QUFDcEMscURBQXVEO0FBQ3ZELHFEQUF5RjtBQUV6RixNQUFNLGtCQUFrQixHQUEyQztJQUMvRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLGVBQWUsRUFBRSxrQ0FBa0M7SUFDbkQsZUFBZSxFQUFFLGtDQUFrQztJQUNuRCxrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCLFNBQVMsRUFBRSxpQ0FBaUM7SUFDNUMscUJBQXFCLEVBQUUsK0JBQStCO0lBQ3RELHFCQUFxQixFQUFFLGtDQUFrQztJQUN6RCxxQkFBcUIsRUFBRSwrQkFBK0I7SUFDdEQsT0FBTyxFQUFFLCtCQUErQjtJQUN4QyxxQkFBcUIsRUFBRSx1Q0FBdUM7SUFDOUQsV0FBVyxFQUFFLElBQUk7SUFDakIsT0FBTyxFQUFFLElBQUk7SUFDYixLQUFLLEVBQUUscUNBQXFDO0lBQzVDLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFdBQVcsRUFBRSx3RUFBd0U7SUFDckYsaUJBQWlCLEVBQUUsMENBQTBDO0NBQ2hFLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxJQUFtQjtJQUNsQyxJQUFJLElBQUk7UUFBRSxPQUFPLGdCQUFnQixJQUFJLEdBQUcsQ0FBQztJQUN6QyxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsc0NBQXNDO0FBQ3RDLG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQy9DLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9B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