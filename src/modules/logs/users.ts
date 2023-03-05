import { stripIndent } from 'common-tags';
import { EmbedBuilder, UserFlagsString } from 'discord.js';
import { capitalize } from 'lodash';
import { CommandoClient, Util } from 'pixoll-commando';
import { isGuildModuleEnabled, compareArrays, customEmoji, hyperlink } from '../../utils';

const userFlagToEmojiMap: Record<UserFlagsString, string | null> = {
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
function imageLink(link: string | null): string {
    if (link) return hyperlink('Click here', link);
    return 'None';
}

/** Handles all of the member logs. */
export default function (client: CommandoClient<true>): void {
    client.on('userUpdate', async (oldUser, newUser) => {
        const { username: name1, discriminator: discrim1, avatar: avatar1, flags: flags1 } = oldUser;
        const { username: name2, discriminator: discrim2, avatar: avatar2, flags: flags2, id, tag } = newUser;
        const userType = newUser.bot ? 'bot' : 'user';

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: `Updated ${userType}`,
                iconURL: newUser.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(`${newUser.toString()} ${tag}`)
            .setFooter({ text: `${capitalize(userType)} ID: ${id}` })
            .setTimestamp();

        if (name1 !== name2) embed.addFields({
            name: 'Username',
            value: `${name1} ➜ ${name2}`,
        });

        if (discrim1 !== discrim2) embed.addFields({
            name: 'Discriminator',
            value: `${discrim1} ➜ ${discrim2}`,
        });

        if (avatar1 !== avatar2) embed.addFields({
            name: 'Avatar',
            value: stripIndent`
            **Before:** ${imageLink(oldUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            **After:** ${imageLink(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            `,
        }).setThumbnail(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }));

        if (flags1 !== flags2) {
            const array1 = Util.filterNullishItems(flags1?.toArray().map(flag => userFlagToEmojiMap[flag]) || []);
            const array2 = Util.filterNullishItems(flags2?.toArray().map(flag => userFlagToEmojiMap[flag]) || []);
            const [added, removed] = compareArrays(array1, array2).map(arr => arr.filter(e => e));

            if (added.length !== 0) embed.addFields({
                name: `${customEmoji('check')} Added badges`,
                value: added.join(', '),
            });
            if (removed.length !== 0) embed.addFields({
                name: `${customEmoji('cross')} Removed badges`,
                value: removed.join(', '),
            });
        }

        if (embed.data.fields?.length === 0) return;

        const guilds = client.guilds.cache.toJSON();
        for (const guild of guilds) {
            const member = guild.members.cache.get(id);
            if (!member) continue;

            const status = await isGuildModuleEnabled(guild, 'audit-logs', 'users');
            if (!status) continue;

            guild.queuedLogs.push(embed);
        }
    });
}
