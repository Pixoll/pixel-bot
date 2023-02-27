import { stripIndent } from 'common-tags';
import {
    EmbedBuilder,
    SystemChannelFlagsString,
    ImageURLOptions,
    GuildDefaultMessageNotifications,
    GuildPremiumTier,
    GuildNSFWLevel,
    GuildFeature,
    GuildVerificationLevel,
    GuildExplicitContentFilter,
    GuildMFALevel,
    Locale,
} from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { arrayEquals, isGuildModuleEnabled, compareArrays, customEmoji, yesOrNo } from '../../utils/functions';
import { ms } from 'better-ms';

const boostLevelMap: Record<GuildPremiumTier, string> = {
    [GuildPremiumTier.None]: 'None',
    [GuildPremiumTier.Tier1]: 'Tier 1',
    [GuildPremiumTier.Tier2]: 'Tier 2',
    [GuildPremiumTier.Tier3]: 'Tier 3',
};

const nsfwLevelMap: Record<GuildNSFWLevel, string> = {
    [GuildNSFWLevel.AgeRestricted]: 'Age restricted',
    [GuildNSFWLevel.Default]: 'Default',
    [GuildNSFWLevel.Explicit]: 'Explicit',
    [GuildNSFWLevel.Safe]: 'Safe',
};

const featureMap: Record<`${GuildFeature}`, string> = {
    ANIMATED_BANNER: 'Animated banner',
    ANIMATED_ICON: 'Animated icon',
    APPLICATION_COMMAND_PERMISSIONS_V2: 'Application command permissions v2',
    AUTO_MODERATION: 'Auto moderation',
    BANNER: 'Banner',
    COMMUNITY: 'Community',
    CREATOR_MONETIZABLE_PROVISIONAL: 'Creator monetizable provisional',
    CREATOR_STORE_PAGE: 'Creator store page',
    DEVELOPER_SUPPORT_SERVER: 'Developer support server',
    DISCOVERABLE: 'Discoverable',
    FEATURABLE: 'Featurable',
    HAS_DIRECTORY_ENTRY: 'Has directory entry',
    HUB: 'Hub',
    INVITE_SPLASH: 'Invite slash',
    INVITES_DISABLED: 'Invites disabled',
    LINKED_TO_HUB: 'Linked to hub',
    MEMBER_VERIFICATION_GATE_ENABLED: 'Member verification gate enabled',
    MONETIZATION_ENABLED: 'Monetization enabled',
    MORE_STICKERS: 'More stickers',
    NEWS: 'News',
    PARTNERED: 'Partnered',
    PREVIEW_ENABLED: 'Preview enabled',
    PRIVATE_THREADS: 'Private threads',
    RELAY_ENABLED: 'Relay enabled',
    ROLE_ICONS: 'Role icons',
    ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE: 'Role subscriptions available for purchase',
    ROLE_SUBSCRIPTIONS_ENABLED: 'Role subscriptions enabled',
    TICKETED_EVENTS_ENABLED: 'Ticketed events enabled',
    VANITY_URL: 'Vanity URL',
    VERIFIED: 'Verified',
    VIP_REGIONS: 'VIP Regions',
    WELCOME_SCREEN_ENABLED: 'Welcome screen enabled',
};

const verificationLevelMap: Record<GuildVerificationLevel, string> = {
    [GuildVerificationLevel.High]: 'High',
    [GuildVerificationLevel.Low]: 'Low',
    [GuildVerificationLevel.Medium]: 'Medium',
    [GuildVerificationLevel.None]: 'None',
    [GuildVerificationLevel.VeryHigh]: 'Very high',
};

const explicitContentFilterMap: Record<GuildExplicitContentFilter, string> = {
    [GuildExplicitContentFilter.AllMembers]: 'All members',
    [GuildExplicitContentFilter.Disabled]: 'Disabled',
    [GuildExplicitContentFilter.MembersWithoutRoles]: 'Members without roles',
};

const systemChannelFlagMap: Record<SystemChannelFlagsString, string> = {
    SuppressGuildReminderNotifications: 'Server setup tips',
    SuppressJoinNotificationReplies: 'Sticker reply button for join notifications',
    SuppressJoinNotifications: 'Join notifications',
    SuppressPremiumSubscriptions: 'Server boost notifications',
    SuppressRoleSubscriptionPurchaseNotificationReplies: 'Role subscription purchase notification reply button',
    SuppressRoleSubscriptionPurchaseNotifications: 'Role subscription purchase notifications',
};

const inverseLocaleMap = Object.fromEntries(Object.entries(Locale).map(([key, value]) =>
    [value, key] as [`${Locale}`, keyof typeof Locale]
));

const imgOptions: ImageURLOptions = {
    forceStatic: false,
    size: 1024,
};

/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param link The link of the image
 */
function imageLink(link: string | null): string {
    if (link) return `[Click here](${link})`;
    return 'None';
}

/** Handles all of the guild logs. */
export default function (client: CommandoClient<true>): void {
    client.on('guildUpdate', async (oldGuild, newGuild) => {
        const isEnabled = await isGuildModuleEnabled(oldGuild, 'audit-logs', 'server');
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

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated server',
                iconURL: newGuild.iconURL(imgOptions) ?? undefined,
            })
            .setTimestamp();

        const imagesEmbed = new EmbedBuilder(embed.toJSON());

        if (name1 !== name2) embed.addFields({
            name: 'Name',
            value: `${name1} ➜ ${name2}`,
        });

        if (desc1 !== desc2) embed.addFields({
            name: 'Description',
            value: stripIndent`
            **Before**
            ${desc1 || 'None'}
            **After**
            ${desc2 || 'None'}
            `,
        });

        if (icon1 !== icon2) {
            imagesEmbed.addFields({
                name: 'Icon',
                value: stripIndent`
                **Before:** ${imageLink(oldGuild.iconURL(imgOptions))}
                **After:** ${imageLink(newGuild.iconURL(imgOptions))}
                `,
            }).setThumbnail(newGuild.iconURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (ownerId1 !== ownerId2) {
            const owner1 = await oldGuild.fetchOwner().catch(() => null).then(m => m?.user);
            const owner2 = await newGuild.fetchOwner().catch(() => null).then(m => m?.user);
            embed.addFields({
                name: 'Owner',
                value: `${owner1?.toString()} ${owner1?.tag} ➜ ${owner2?.toString()} ${owner2?.tag}`,
            });
        }

        if (sysChan1 !== sysChan2) embed.addFields({
            name: 'System messages channel',
            value: `${sysChan1?.toString() || 'None'} ➜ ${sysChan2?.toString() || 'None'}`,
        });

        if (!arrayEquals(sysChanFlags1.toArray(), sysChanFlags2.toArray())) {
            const [enabledFlags, disabledFlags] = compareArrays(
                sysChanFlags2.toArray().map(feat => systemChannelFlagMap[feat]),
                sysChanFlags1.toArray().map(feat => systemChannelFlagMap[feat])
            );

            const enabled = enabledFlags.join(', ') ? stripIndent`
                **Enabled**
                ${enabledFlags.join(', ') || 'None'}
            ` : '';

            const disabled = disabledFlags.join(', ') ? stripIndent`
                **Disabled**
                ${disabledFlags.join(', ') || 'None'}
            ` : '';

            embed.addFields({
                name: 'System channel options',
                value: `${enabled}\n${disabled}`,
            });
        }

        if (afkChan1 !== afkChan2) embed.addFields({
            name: 'AFK channel',
            value: `${afkChan1?.toString() || 'None'} ➜ ${afkChan2?.toString() || 'None'}`,
        });

        if (afkTo1 !== afkTo2) embed.addFields({
            name: 'AFK timeout',
            value: `${ms(afkTo1 * 1000, { long: true })} ➜ ${ms(afkTo2 * 1000, { long: true })}`,
        });

        if (notif1 !== notif2) embed.addFields({
            name: 'Default notification settings',
            value: notif1 === GuildDefaultMessageNotifications.AllMessages
                ? 'All messages ➜ Only @mentions'
                : 'Only @mentions ➜ All messages',
        });

        if (banner1 !== banner2) {
            imagesEmbed.spliceFields(0, 1, {
                name: 'Banner',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.bannerURL(imgOptions))}
                    **After:** ${imageLink(newGuild.bannerURL(imgOptions))}
                `,
            }).setThumbnail(newGuild.bannerURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (splash1 !== splash2) {
            imagesEmbed.spliceFields(0, 1, {
                name: 'Invite splash image',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.splashURL(imgOptions))}
                    **After:** ${imageLink(newGuild.splashURL(imgOptions))}
                `,
            }).setThumbnail(newGuild.splashURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (boostProgressBar1 !== boostProgressBar2) embed.addFields({
            name: 'Boost progress bar',
            value: boostProgressBar1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled',
        });

        if (url1 !== url2) embed.addFields({
            name: 'Vanity URL code',
            value: `${url1 || 'None'} ➜ ${url2 || 'None'}`,
        });

        if (!arrayEquals(features1, features2)) {
            const [addedFeat, removedFeat] = compareArrays(
                features1.map(feat => featureMap[feat]),
                features2.map(feat => featureMap[feat])
            );

            const added = addedFeat.join(', ') ? stripIndent`
                ${customEmoji('check')} **Added**
                ${addedFeat.join(', ') || 'None'}
            ` : '';

            const removed = removedFeat.join(', ') ? stripIndent`
                ${customEmoji('cross')} **Removed**
                ${removedFeat.join(', ') || 'None'}
            ` : '';

            embed.addFields({
                name: 'Features',
                value: `${added}\n${removed}`,
            });
        }

        if (partner1 !== partner2) embed.addFields({
            name: 'Partnered',
            value: yesOrNo(partner1),
        });

        if (verified1 !== verified2) embed.addFields({
            name: 'Verified',
            value: yesOrNo(verified1),
        });

        if (maxBitrate1 !== maxBitrate2) embed.addFields({
            name: 'Max. bitrate',
            value: maxBitrate1 / 1000 + 'kbps ➜ ' + maxBitrate2 / 1000 + 'kbps',
        });

        if (boostLvl1 !== boostLvl2) embed.addFields({
            name: 'Server boost level',
            value: `${boostLevelMap[boostLvl1]} ➜ ${boostLevelMap[boostLvl2]}`,
        });

        if (nsfw1 !== nsfw2) embed.addFields({
            name: 'NSFW level',
            value: `${nsfwLevelMap[nsfw1]} ➜ ${nsfwLevelMap[nsfw2]}`,
        });

        if (verLVL1 !== verLVL2) embed.addFields({
            name: 'Verification level',
            value: `${verificationLevelMap[verLVL1]} ➜ ${verificationLevelMap[verLVL2]}`,
        });

        if (expFilter1 !== expFilter2) embed.addFields({
            name: 'Explicit content filter',
            value: `${explicitContentFilterMap[expFilter1]} ➜ ${explicitContentFilterMap[expFilter2]}`,
        });

        if (mfa1 !== mfa2) embed.addFields({
            name: '2FA requirement for moderation',
            value: mfa1 === GuildMFALevel.None ? 'Disabled ➜ Enabled' : 'Enabled ➜ Disabled',
        });

        if (widgetChan1 !== widgetChan2) embed.addFields({
            name: 'Widget channel',
            value: `${widgetChan1?.toString() || 'None'} ➜ ${widgetChan2?.toString() || 'None'}`,
        });

        if (widgetOn1 !== widgetOn2) embed.addFields({
            name: 'Widget',
            value: widgetOn1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled',
        });

        if (discSplash1 !== discSplash2) {
            imagesEmbed.spliceFields(0, 1, {
                name: 'Discovery splash image',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.discoverySplashURL(imgOptions))}
                    **After:** ${imageLink(newGuild.discoverySplashURL(imgOptions))}
                `,
            }).setThumbnail(newGuild.discoverySplashURL(imgOptions));

            newGuild.queuedLogs.push(imagesEmbed);
        }

        if (updateChan1 !== updateChan2) embed.addFields({
            name: 'Community updates channel',
            value: `${updateChan1?.toString() || 'None'} ➜ ${updateChan2?.toString() || 'None'}`,
        });

        if (rulesChan1 !== rulesChan2) embed.addFields({
            name: 'Rules or Guidelines channel',
            value: `${rulesChan1?.toString() || 'None'} ➜ ${rulesChan2?.toString() || 'None'}`,
        });

        if (lang1 !== lang2) embed.addFields({
            name: 'Primary language',
            value: `${inverseLocaleMap[lang1]} ➜ ${inverseLocaleMap[lang2]}`,
        });

        if (embed.data.fields?.length !== 0 || embed.data.description) {
            newGuild.queuedLogs.push(embed);
        }
    });
}
