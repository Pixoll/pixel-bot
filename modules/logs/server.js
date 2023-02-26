/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const {
    MessageEmbed, User, GuildFeatures, VerificationLevel, ExplicitContentFilterLevel, SystemChannelFlagsString,
} = require('discord.js');
const { capitalize } = require('lodash');
const { CommandoClient } = require('pixoll-commando');
const { arrayEquals, isModuleEnabled, compareArrays, customEmoji } = require('../../utils/functions');
const myMs = require('../../utils/my-ms');
/* eslint-enable no-unused-vars */

/**
 * Format's a permission into a string.
 * @param {string} perm The permission to format.
 * @param {boolean} [codeLike] If the resulting string should be surrounded by \`these\`.
 */
function removeUnderscores(perm, codeLike) {
    const string = capitalize(perm.replace(/_/g, ' '));

    if (codeLike) return `\`${string}\``;
    return string;
}

/**
 * Parses a guild feature.
 * @param {GuildFeatures} feat The feature to parse.
 * @returns {string}
 */
function guildFeature(feat) {
    switch (feat) {
        case 'ANIMATED_ICON': return 'Animated icon';
        case 'BANNER': return 'Banner';
        case 'COMMERCE': return 'Commerce';
        case 'COMMUNITY': return 'Community';
        case 'DISCOVERABLE': return 'Discoverable';
        case 'FEATURABLE': return 'Featurable';
        case 'INVITE_SPLASH': return 'Invite splash';
        case 'MEMBER_VERIFICATION_GATE_ENABLED': return 'Membership screening';
        case 'NEWS': return 'News';
        case 'PARTNERED': return 'Partnered';
        case 'PREVIEW_ENABLED': return 'Preview';
        case 'VANITY_URL': return 'Vanity URL';
        case 'VERIFIED': return 'Verified';
        case 'VIP_REGIONS': return 'VIP Regions';
        case 'WELCOME_SCREEN_ENABLED': return 'Welcome screen';
        case 'TICKETED_EVENTS_ENABLED': return 'Ticketed events';
        case 'MONETIZATION_ENABLED': return 'Monetization';
        case 'MORE_STICKERS': return 'More stickers';
        case 'THREE_DAY_THREAD_ARCHIVE': return 'Thread 3 day archive';
        case 'SEVEN_DAY_THREAD_ARCHIVE': return 'Thread 1 week archive';
        case 'PRIVATE_THREADS': return 'Private threads';
    }
}

/**
 * Parses a verification level.
 * @param {VerificationLevel} lvl The level to parse.
 * @returns {string}
 */
function verLvl(lvl) {
    switch (lvl) {
        case 'NONE': return 'None';
        case 'LOW': return 'Low';
        case 'MEDIUM': return 'Medium';
        case 'HIGH': return 'High';
        case 'VERY_HIGH': return 'Highest';
    }
}

/**
 * Parses an R-18 content filter level.
 * @param {ExplicitContentFilterLevel} lvl The level to parse.
 * @returns {string}
 */
function r18filter(lvl) {
    switch (lvl) {
        case 'DISABLED': return 'Don\'t scan any media content';
        case 'MEMBERS_WITHOUT_ROLES': return 'Scan media content from members without a role';
        case 'ALL_MEMBERS': return 'Scan media content from all members';
    }
}

/**
 * Parses a system channel flag.
 * @param {SystemChannelFlagsString} flag The flag to parse.
 * @returns {string}
 */
function sysChanFlag(flag) {
    switch (flag) {
        case 'SUPPRESS_JOIN_NOTIFICATIONS': return 'Join messages';
        case 'SUPPRESS_PREMIUM_SUBSCRIPTIONS': return 'Server boosts messages';
        case 'SUPPRESS_GUILD_REMINDER_NOTIFICATIONS': return 'Server setup tips';
        case 'SUPPRESS_JOIN_NOTIFICATION_REPLIES': return 'Sticker reply button for join messages';
    }
}

/**
 * Parses a language ID.
 * @param {string} lang The language to parse.
 * @returns {string}
 */
function locale(lang) {
    switch (lang) {
        case 'en-US': return 'English (United States)';
        case 'en-GB': return 'English (Great Britain)';
        case 'zh-CN': return 'Chinese (China)';
        case 'zh-TW': return 'Chinese (Taiwan)';
        case 'cs': return 'Czech';
        case 'da': return 'Danish';
        case 'nl': return 'Dutch';
        case 'fr': return 'French';
        case 'de': return 'German';
        case 'el': return 'Greek';
        case 'hu': return 'Hungarian';
        case 'it': return 'Italian';
        case 'ja': return 'Japanese';
        case 'ko': return 'Korean';
        case 'no': return 'Norwegian';
        case 'pl': return 'Polish';
        case 'pt-BR': return 'Portuguese (Brazil)';
        case 'ru': return 'Russian';
        case 'es-ES': return 'Spanish (Spain)';
        case 'sv-SE': return 'Swedish';
        case 'tr': return 'Turkish';
        case 'bg': return 'Bulgarian';
        case 'uk': return 'Ukrainian';
        case 'fi': return 'Finnish';
        case 'hr': return 'Croatian';
        case 'ro': return 'Romanian';
        case 'lt': return 'Lithuanian';
    }
}

/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param {string} link The link of the image
 */
function imageLink(link) {
    if (link) return `[Click here](${link})`;
    return 'None';
}

/**
 * Handles all of the guild logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildUpdate', async (oldGuild, newGuild) => {
        const isEnabled = await isModuleEnabled(oldGuild, 'audit-logs', 'server');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/server".');

        const {
            name: name1, systemChannel: sysChan1, afkChannel: afkChan1, afkTimeout: afkTo1, ownerId: ownerId1,
            defaultMessageNotifications: notif1, banner: banner1, description: desc1, splash: splash1, vanityURLCode: url1,
            features: features1, icon: icon1, verificationLevel: verLVL1, explicitContentFilter: expFilter1,
            mfaLevel: mfa1, widgetChannel: widgetChan1, widgetEnabled: widgetOn1, discoverySplash: discSplash1,
            publicUpdatesChannel: updateChan1, rulesChannel: rulesChan1, preferredLocale: lang1, nsfwLevel: nsfw1,
            partnered: partner1, premiumTier: boostLvl1, systemChannelFlags: sysChanFlags1, verified: verified1,
            maximumBitrate: maxBitrate1, premiumProgressBarEnabled: boostProgressBar1,
        } = oldGuild;
        const {
            name: name2, systemChannel: sysChan2, afkChannel: afkChan2, afkTimeout: afkTo2, ownerId: ownerId2,
            defaultMessageNotifications: notif2, banner: banner2, description: desc2, splash: splash2, vanityURLCode: url2,
            features: features2, icon: icon2, verificationLevel: verLVL2, explicitContentFilter: expFilter2,
            mfaLevel: mfa2, widgetChannel: widgetChan2, widgetEnabled: widgetOn2, discoverySplash: discSplash2,
            publicUpdatesChannel: updateChan2, rulesChannel: rulesChan2, preferredLocale: lang2, nsfwLevel: nsfw2,
            partnered: partner2, premiumTier: boostLvl2, systemChannelFlags: sysChanFlags2, verified: verified2,
            maximumBitrate: maxBitrate2, premiumProgressBarEnabled: boostProgressBar2,
        } = newGuild;

        const imgOptions = { dynamic: true, size: 1024 };

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated server', iconURL: newGuild.iconURL(imgOptions),
            })
            .setTimestamp();

        const imagesEmbed = new MessageEmbed(embed);

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`);

        if (desc1 !== desc2) {
            embed.addField('Description', stripIndent`
                **Before**
                ${desc1 || 'None'}
                **After**
                ${desc2 || 'None'}
            `);
        }

        if (icon1 !== icon2) {
            imagesEmbed.addField('Icon', stripIndent`
                **Before:** ${imageLink(oldGuild.iconURL(imgOptions), true)}
                **After:** ${imageLink(newGuild.iconURL(imgOptions))}
            `).setThumbnail(newGuild.iconURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (ownerId1 !== ownerId2) {
            /** @type {User} */
            const owner1 = client.users.fetch(ownerId1).catch(() => null);
            /** @type {User} */
            const owner2 = client.users.fetch(ownerId1).catch(() => null);
            embed.addField('Owner', `${owner1.toString()} ${owner1.tag} ➜ ${owner2.toString()} ${owner2.tag}`);
        }

        if (sysChan1 !== sysChan2) {
            embed.addField(
                'System messages channel',
                `${sysChan1?.toString() || 'None'} ➜ ${sysChan2?.toString() || 'None'}`
            );
        }

        if (!arrayEquals(sysChanFlags1.toArray(), sysChanFlags2.toArray())) {
            const [enabledFlags, disabledFlags] = compareArrays(
                sysChanFlags2.toArray().map(feat => sysChanFlag(feat)),
                sysChanFlags1.toArray().map(feat => sysChanFlag(feat))
            );

            const enabled = enabledFlags.join(', ') ? stripIndent`
                **Enabled**
                ${enabledFlags.join(', ') || 'None'}
            ` : '';

            const disabled = disabledFlags.join(', ') ? stripIndent`
                **Disabled**
                ${disabledFlags.join(', ') || 'None'}
            ` : '';

            embed.addField('System channel options', `${enabled}\n${disabled}`);
        }

        if (afkChan1 !== afkChan2) {
            embed.addField('AFK channel', `${afkChan1?.toString() || 'None'} ➜ ${afkChan2?.toString() || 'None'}`);
        }

        if (afkTo1 !== afkTo2) {
            embed.addField(
                'AFK timeout',
                `${myMs(afkTo1 * 1000, { long: true })} ➜ ${myMs(afkTo2 * 1000, { long: true })}`
            );
        }

        if (notif1 !== notif2) {
            embed.addField(
                'Default notification settings',
                notif1 === 'ALL_MESSAGES' || notif1 === 0
                    ? 'All messages ➜ Only @mentions' : 'Only @mentions ➜ All messages'
            );
        }

        if (banner1 !== banner2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Banner',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.bannerURL(imgOptions), true)}
                    **After:** ${imageLink(newGuild.bannerURL(imgOptions))}
                `,
            }]).setThumbnail(newGuild.bannerURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (splash1 !== splash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Invite splash image',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.splashURL(imgOptions), true)}
                    **After:** ${imageLink(newGuild.splashURL(imgOptions))}
                `,
            }]).setThumbnail(newGuild.splashURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (boostProgressBar1 !== boostProgressBar2) {
            embed.addField('Boost progress bar', boostProgressBar1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled');
        }

        if (url1 !== url2) embed.addField('Vanity URL code', `${url1 || 'None'} ➜ ${url2 || 'None'}`);

        if (!arrayEquals(features1, features2)) {
            const [addedFeat, removedFeat] = compareArrays(
                features1.map(feat => guildFeature(feat)),
                features2.map(feat => guildFeature(feat))
            );

            const added = addedFeat.join(', ') ? stripIndent`
                ${customEmoji('check')} **Added**
                ${addedFeat.join(', ') || 'None'}
            ` : '';

            const removed = removedFeat.join(', ') ? stripIndent`
                ${customEmoji('cross')} **Removed**
                ${removedFeat.join(', ') || 'None'}
            ` : '';

            embed.addField('Features', `${added}\n${removed}`);
        }

        if (partner1 !== partner2) embed.addField('Partnered', partner1 ? 'Yes ➜ No' : 'No ➜ Yes');

        if (verified1 !== verified2) embed.addField('Verified', verified1 ? 'Yes ➜ No' : 'No ➜ Yes');

        if (maxBitrate1 !== maxBitrate2) {
            embed.addField('Max. bitrate', maxBitrate1 / 1000 + 'kbps ➜ ' + maxBitrate2 / 1000 + 'kbps');
        }

        if (boostLvl1 !== boostLvl2) {
            embed.addField('Server boost level', `${removeUnderscores(boostLvl1)} ➜ ${removeUnderscores(boostLvl2)}`);
        }

        if (nsfw1 !== nsfw2) {
            embed.addField('NSFW level', `${removeUnderscores(nsfw1)} ➜ ${removeUnderscores(nsfw2)}`);
        }

        if (verLVL1 !== verLVL2) {
            embed.addField('Verification level', `${verLvl(verLVL1)} ➜ ${verLvl(verLVL2)}`);
        }

        if (expFilter1 !== expFilter2) {
            embed.addField('Explicit content filter', `${r18filter(expFilter1)} ➜ ${r18filter(expFilter2)}`);
        }

        if (mfa1 !== mfa2) {
            embed.addField('2FA requirement for moderation', mfa1 === 'NONE' ? 'Disabled ➜ Enabled' : 'Enabled ➜ Disabled');
        }

        if (widgetChan1 !== widgetChan2) {
            embed.addField('Widget channel', `${widgetChan1?.toString() || 'None'} ➜ ${widgetChan2?.toString() || 'None'}`);
        }

        if (widgetOn1 !== widgetOn2) embed.addField('Widget', widgetOn1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled');

        if (discSplash1 !== discSplash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Discovery splash image',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.discoverySplashURL(imgOptions), true)}
                    **After:** ${imageLink(newGuild.discoverySplashURL(imgOptions))}
                `,
            }]).setThumbnail(newGuild.discoverySplashURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (updateChan1 !== updateChan2) {
            embed.addField(
                'Community updates channel',
                `${updateChan1?.toString() || 'None'} ➜ ${updateChan2?.toString() || 'None'}`
            );
        }

        if (rulesChan1 !== rulesChan2) {
            embed.addField(
                'Rules or Guidelines channel',
                `${rulesChan1?.toString() || 'None'} ➜ ${rulesChan2?.toString() || 'None'}`
            );
        }

        if (lang1 !== lang2) embed.addField('Primary language', `${locale(lang1)} ➜ ${locale(lang2)}`);

        if (embed.fields.length !== 0 || embed.description) {
            newGuild.queuedLogs.push(embed);
        }
    });
};
