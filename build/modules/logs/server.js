"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const better_ms_1 = require("better-ms");
const boostLevelMap = {
    [discord_js_1.GuildPremiumTier.None]: 'None',
    [discord_js_1.GuildPremiumTier.Tier1]: 'Tier 1',
    [discord_js_1.GuildPremiumTier.Tier2]: 'Tier 2',
    [discord_js_1.GuildPremiumTier.Tier3]: 'Tier 3',
};
const nsfwLevelMap = {
    [discord_js_1.GuildNSFWLevel.AgeRestricted]: 'Age restricted',
    [discord_js_1.GuildNSFWLevel.Default]: 'Default',
    [discord_js_1.GuildNSFWLevel.Explicit]: 'Explicit',
    [discord_js_1.GuildNSFWLevel.Safe]: 'Safe',
};
const featureMap = {
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
    RAID_ALERTS_DISABLED: 'Raid alerts disabled',
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
const verificationLevelMap = {
    [discord_js_1.GuildVerificationLevel.High]: 'High',
    [discord_js_1.GuildVerificationLevel.Low]: 'Low',
    [discord_js_1.GuildVerificationLevel.Medium]: 'Medium',
    [discord_js_1.GuildVerificationLevel.None]: 'None',
    [discord_js_1.GuildVerificationLevel.VeryHigh]: 'Very high',
};
const explicitContentFilterMap = {
    [discord_js_1.GuildExplicitContentFilter.AllMembers]: 'All members',
    [discord_js_1.GuildExplicitContentFilter.Disabled]: 'Disabled',
    [discord_js_1.GuildExplicitContentFilter.MembersWithoutRoles]: 'Members without roles',
};
const systemChannelFlagMap = {
    SuppressGuildReminderNotifications: 'Server setup tips',
    SuppressJoinNotificationReplies: 'Sticker reply button for join notifications',
    SuppressJoinNotifications: 'Join notifications',
    SuppressPremiumSubscriptions: 'Server boost notifications',
    SuppressRoleSubscriptionPurchaseNotificationReplies: 'Role subscription purchase notification reply button',
    SuppressRoleSubscriptionPurchaseNotifications: 'Role subscription purchase notifications',
};
const inverseLocaleMap = Object.fromEntries(Object.entries(discord_js_1.Locale).map(([key, value]) => [value, key]));
const imgOptions = {
    forceStatic: false,
    size: 1024,
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
/** Handles all of the guild logs. */
function default_1(client) {
    client.on('guildUpdate', async (oldGuild, newGuild) => {
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(oldGuild, 'audit-logs', 'server');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/server".');
        const { name: name1, systemChannel: sysChan1, afkChannel: afkChan1, afkTimeout: afkTo1, ownerId: ownerId1, defaultMessageNotifications: notif1, banner: banner1, description: desc1, splash: splash1, vanityURLCode: url1, features: features1, icon: icon1, verificationLevel: verLVL1, explicitContentFilter: expFilter1, mfaLevel: mfa1, widgetChannel: widgetChan1, widgetEnabled: widgetOn1, discoverySplash: discSplash1, publicUpdatesChannel: updateChan1, rulesChannel: rulesChan1, preferredLocale: lang1, nsfwLevel: nsfw1, partnered: partner1, premiumTier: boostLvl1, systemChannelFlags: sysChanFlags1, verified: verified1, maximumBitrate: maxBitrate1, premiumProgressBarEnabled: boostProgressBar1, } = oldGuild;
        const { name: name2, systemChannel: sysChan2, afkChannel: afkChan2, afkTimeout: afkTo2, ownerId: ownerId2, defaultMessageNotifications: notif2, banner: banner2, description: desc2, splash: splash2, vanityURLCode: url2, features: features2, icon: icon2, verificationLevel: verLVL2, explicitContentFilter: expFilter2, mfaLevel: mfa2, widgetChannel: widgetChan2, widgetEnabled: widgetOn2, discoverySplash: discSplash2, publicUpdatesChannel: updateChan2, rulesChannel: rulesChan2, preferredLocale: lang2, nsfwLevel: nsfw2, partnered: partner2, premiumTier: boostLvl2, systemChannelFlags: sysChanFlags2, verified: verified2, maximumBitrate: maxBitrate2, premiumProgressBarEnabled: boostProgressBar2, } = newGuild;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated server',
            iconURL: newGuild.iconURL(imgOptions) ?? undefined,
        })
            .setTimestamp();
        const imagesEmbed = new discord_js_1.EmbedBuilder(embed.toJSON());
        if (name1 !== name2)
            embed.addFields({
                name: 'Name',
                value: `${name1} ➜ ${name2}`,
            });
        if (desc1 !== desc2)
            embed.addFields({
                name: 'Description',
                value: (0, common_tags_1.stripIndent) `
            **Before**
            ${desc1 || 'None'}
            **After**
            ${desc2 || 'None'}
            `,
            });
        if (icon1 !== icon2) {
            imagesEmbed.addFields({
                name: 'Icon',
                value: (0, common_tags_1.stripIndent) `
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
        if (sysChan1 !== sysChan2)
            embed.addFields({
                name: 'System messages channel',
                value: `${sysChan1?.toString() || 'None'} ➜ ${sysChan2?.toString() || 'None'}`,
            });
        if (!(0, utils_1.arrayEquals)(sysChanFlags1.toArray(), sysChanFlags2.toArray())) {
            const [enabledFlags, disabledFlags] = (0, utils_1.compareArrays)(sysChanFlags2.toArray().map(feat => systemChannelFlagMap[feat]), sysChanFlags1.toArray().map(feat => systemChannelFlagMap[feat]));
            const enabled = enabledFlags.join(', ') ? (0, common_tags_1.stripIndent) `
                **Enabled**
                ${enabledFlags.join(', ') || 'None'}
            ` : '';
            const disabled = disabledFlags.join(', ') ? (0, common_tags_1.stripIndent) `
                **Disabled**
                ${disabledFlags.join(', ') || 'None'}
            ` : '';
            embed.addFields({
                name: 'System channel options',
                value: `${enabled}\n${disabled}`,
            });
        }
        if (afkChan1 !== afkChan2)
            embed.addFields({
                name: 'AFK channel',
                value: `${afkChan1?.toString() || 'None'} ➜ ${afkChan2?.toString() || 'None'}`,
            });
        if (afkTo1 !== afkTo2)
            embed.addFields({
                name: 'AFK timeout',
                value: `${(0, better_ms_1.ms)(afkTo1 * 1000, { long: true })} ➜ ${(0, better_ms_1.ms)(afkTo2 * 1000, { long: true })}`,
            });
        if (notif1 !== notif2)
            embed.addFields({
                name: 'Default notification settings',
                value: notif1 === discord_js_1.GuildDefaultMessageNotifications.AllMessages
                    ? 'All messages ➜ Only @mentions'
                    : 'Only @mentions ➜ All messages',
            });
        if (banner1 !== banner2) {
            imagesEmbed.spliceFields(0, 1, {
                name: 'Banner',
                value: (0, common_tags_1.stripIndent) `
                    **Before:** ${imageLink(oldGuild.bannerURL(imgOptions))}
                    **After:** ${imageLink(newGuild.bannerURL(imgOptions))}
                `,
            }).setThumbnail(newGuild.bannerURL(imgOptions));
            newGuild.queuedLogs.push(imagesEmbed);
        }
        if (splash1 !== splash2) {
            imagesEmbed.spliceFields(0, 1, {
                name: 'Invite splash image',
                value: (0, common_tags_1.stripIndent) `
                    **Before:** ${imageLink(oldGuild.splashURL(imgOptions))}
                    **After:** ${imageLink(newGuild.splashURL(imgOptions))}
                `,
            }).setThumbnail(newGuild.splashURL(imgOptions));
            newGuild.queuedLogs.push(imagesEmbed);
        }
        if (boostProgressBar1 !== boostProgressBar2)
            embed.addFields({
                name: 'Boost progress bar',
                value: boostProgressBar1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled',
            });
        if (url1 !== url2)
            embed.addFields({
                name: 'Vanity URL code',
                value: `${url1 || 'None'} ➜ ${url2 || 'None'}`,
            });
        if (!(0, utils_1.arrayEquals)(features1, features2)) {
            const [addedFeat, removedFeat] = (0, utils_1.compareArrays)(features1.map(feat => featureMap[feat]), features2.map(feat => featureMap[feat]));
            const added = addedFeat.join(', ') ? (0, common_tags_1.stripIndent) `
                ${(0, utils_1.customEmoji)('check')} **Added**
                ${addedFeat.join(', ') || 'None'}
            ` : '';
            const removed = removedFeat.join(', ') ? (0, common_tags_1.stripIndent) `
                ${(0, utils_1.customEmoji)('cross')} **Removed**
                ${removedFeat.join(', ') || 'None'}
            ` : '';
            embed.addFields({
                name: 'Features',
                value: `${added}\n${removed}`,
            });
        }
        if (partner1 !== partner2)
            embed.addFields({
                name: 'Partnered',
                value: (0, utils_1.yesOrNo)(partner1),
            });
        if (verified1 !== verified2)
            embed.addFields({
                name: 'Verified',
                value: (0, utils_1.yesOrNo)(verified1),
            });
        if (maxBitrate1 !== maxBitrate2)
            embed.addFields({
                name: 'Max. bitrate',
                value: maxBitrate1 / 1000 + 'kbps ➜ ' + maxBitrate2 / 1000 + 'kbps',
            });
        if (boostLvl1 !== boostLvl2)
            embed.addFields({
                name: 'Server boost level',
                value: `${boostLevelMap[boostLvl1]} ➜ ${boostLevelMap[boostLvl2]}`,
            });
        if (nsfw1 !== nsfw2)
            embed.addFields({
                name: 'NSFW level',
                value: `${nsfwLevelMap[nsfw1]} ➜ ${nsfwLevelMap[nsfw2]}`,
            });
        if (verLVL1 !== verLVL2)
            embed.addFields({
                name: 'Verification level',
                value: `${verificationLevelMap[verLVL1]} ➜ ${verificationLevelMap[verLVL2]}`,
            });
        if (expFilter1 !== expFilter2)
            embed.addFields({
                name: 'Explicit content filter',
                value: `${explicitContentFilterMap[expFilter1]} ➜ ${explicitContentFilterMap[expFilter2]}`,
            });
        if (mfa1 !== mfa2)
            embed.addFields({
                name: '2FA requirement for moderation',
                value: mfa1 === discord_js_1.GuildMFALevel.None ? 'Disabled ➜ Enabled' : 'Enabled ➜ Disabled',
            });
        if (widgetChan1 !== widgetChan2)
            embed.addFields({
                name: 'Widget channel',
                value: `${widgetChan1?.toString() || 'None'} ➜ ${widgetChan2?.toString() || 'None'}`,
            });
        if (widgetOn1 !== widgetOn2)
            embed.addFields({
                name: 'Widget',
                value: widgetOn1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled',
            });
        if (discSplash1 !== discSplash2) {
            imagesEmbed.spliceFields(0, 1, {
                name: 'Discovery splash image',
                value: (0, common_tags_1.stripIndent) `
                    **Before:** ${imageLink(oldGuild.discoverySplashURL(imgOptions))}
                    **After:** ${imageLink(newGuild.discoverySplashURL(imgOptions))}
                `,
            }).setThumbnail(newGuild.discoverySplashURL(imgOptions));
            newGuild.queuedLogs.push(imagesEmbed);
        }
        if (updateChan1 !== updateChan2)
            embed.addFields({
                name: 'Community updates channel',
                value: `${updateChan1?.toString() || 'None'} ➜ ${updateChan2?.toString() || 'None'}`,
            });
        if (rulesChan1 !== rulesChan2)
            embed.addFields({
                name: 'Rules or Guidelines channel',
                value: `${rulesChan1?.toString() || 'None'} ➜ ${rulesChan2?.toString() || 'None'}`,
            });
        if (lang1 !== lang2)
            embed.addFields({
                name: 'Primary language',
                value: `${inverseLocaleMap[lang1]} ➜ ${inverseLocaleMap[lang2]}`,
            });
        if (embed.data.fields?.length !== 0 || embed.data.description) {
            newGuild.queuedLogs.push(embed);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbG9ncy9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBWW9CO0FBRXBCLHVDQUFnSDtBQUNoSCx5Q0FBK0I7QUFFL0IsTUFBTSxhQUFhLEdBQXFDO0lBQ3BELENBQUMsNkJBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTTtJQUMvQixDQUFDLDZCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVE7SUFDbEMsQ0FBQyw2QkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRO0lBQ2xDLENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUTtDQUNyQyxDQUFDO0FBRUYsTUFBTSxZQUFZLEdBQW1DO0lBQ2pELENBQUMsMkJBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRSxnQkFBZ0I7SUFDaEQsQ0FBQywyQkFBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVM7SUFDbkMsQ0FBQywyQkFBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQVU7SUFDckMsQ0FBQywyQkFBYyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU07Q0FDaEMsQ0FBQztBQUVGLE1BQU0sVUFBVSxHQUFzQztJQUNsRCxlQUFlLEVBQUUsaUJBQWlCO0lBQ2xDLGFBQWEsRUFBRSxlQUFlO0lBQzlCLGtDQUFrQyxFQUFFLG9DQUFvQztJQUN4RSxlQUFlLEVBQUUsaUJBQWlCO0lBQ2xDLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLCtCQUErQixFQUFFLGlDQUFpQztJQUNsRSxrQkFBa0IsRUFBRSxvQkFBb0I7SUFDeEMsd0JBQXdCLEVBQUUsMEJBQTBCO0lBQ3BELFlBQVksRUFBRSxjQUFjO0lBQzVCLFVBQVUsRUFBRSxZQUFZO0lBQ3hCLG1CQUFtQixFQUFFLHFCQUFxQjtJQUMxQyxHQUFHLEVBQUUsS0FBSztJ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