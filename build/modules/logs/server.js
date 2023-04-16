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