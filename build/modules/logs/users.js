"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
        return (0, utils_1.hyperlink)('Click here', link);
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
            const [added, removed] = (0, utils_1.compareArrays)(array1, array2).map(arr => arr.filter(e => e));
            if (added.length !== 0)
                embed.addFields({
                    name: `${(0, utils_1.customEmoji)('check')} Added badges`,
                    value: added.join(', '),
                });
            if (removed.length !== 0)
                embed.addFields({
                    name: `${(0, utils_1.customEmoji)('cross')} Removed badges`,
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
            const status = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'users');
            if (!status)
                continue;
            guild.queuedLogs.push(embed);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL3VzZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEyRDtBQUMzRCxtQ0FBb0M7QUFDcEMscURBQXVEO0FBQ3ZELHVDQUEwRjtBQUUxRixNQUFNLGtCQUFrQixHQUEyQztJQUMvRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLGVBQWUsRUFBRSxrQ0FBa0M7SUFDbkQsZUFBZSxFQUFFLGtDQUFrQztJQUNuRCxrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCLFNBQVMsRUFBRSxpQ0FBaUM7SUFDNUMscUJBQXFCLEVBQUUsK0JBQStCO0lBQ3RELHFCQUFxQixFQUFFLGtDQUFrQztJQUN6RCxxQkFBcUIsRUFBRSwrQkFBK0I7SUFDdEQsT0FBTyxFQUFFLCtCQUErQjtJQUN4QyxxQkFBcUIsRUFBRSx1Q0FBdUM7SUFDOUQsV0FBVyxFQUFFLElBQUk7SUFDakIsT0FBTyxFQUFFLElBQUk7SUFDYixLQUFLLEVBQUUscUNBQXFDO0lBQzVDLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFdBQVcsRUFBRSx3RUFBd0U7SUFDckYsaUJBQWlCLEVBQUUsMENBQTBDO0NBQ2hFLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxJQUFtQjtJQUNsQyxJQUFJLElBQUk7UUFBRSxPQUFPLElBQUEsaUJBQVMsRUFBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0MsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUVELHNDQUFzQztBQUN0QyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMvQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsUUFB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