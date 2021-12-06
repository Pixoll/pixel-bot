/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, User } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const {
    arrayEquals, isModuleEnabled, getLogsChannel, myMs, guildFeatures, verificationLevels, R18ContentFilter,
    locales, nsfwLevels, removeUnderscores, sysChannelFlags, sliceFileName
} = require('../../utils')
/* eslint-enable no-unused-vars */

/**
 * Compares and returns the difference between the set of permissions
 * @param {string[]} Old The old permissions
 * @param {string[]} New The new permissions
 */
function compareArrays(Old = [], New = []) {
    const arr1 = New.filter(perm => !Old.includes(perm))
    const arr2 = Old.filter(perm => !New.includes(perm))
    return [arr1, arr2]
}

/**
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 */
function imageLink(link) {
    if (link) return `[Click here](${link})`
    return 'None'
}

/**
 * Handles all of the guild logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildUpdate', async (oldGuild, newGuild) => {
        client.emit('debug', `Running event "${sliceFileName(__filename)}#guildUpdate".`)

        const isEnabled = await isModuleEnabled(oldGuild, 'audit-logs', 'server')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(oldGuild)
        if (!logsChannel) return

        const {
            name: name1, systemChannel: sysChan1, afkChannel: afkChan1, afkTimeout: afkTo1, ownerId: ownerId1,
            defaultMessageNotifications: notif1, banner: banner1, description: desc1, splash: splash1, vanityURLCode: url1,
            features: features1, icon: icon1, verificationLevel: verLVL1, explicitContentFilter: expFilter1,
            mfaLevel: mfa1, widgetChannel: widgetChan1, widgetEnabled: widgetOn1, discoverySplash: discSplash1,
            publicUpdatesChannel: updateChan1, rulesChannel: rulesChan1, preferredLocale: lang1, nsfwLevel: nsfw1,
            partnered: partner1, premiumTier: boostLvl1, systemChannelFlags: sysChanFlags1, verified: verified1,
            maximumBitrate: maxBitrate1
        } = oldGuild
        const {
            name: name2, systemChannel: sysChan2, afkChannel: afkChan2, afkTimeout: afkTo2, ownerId: ownerId2,
            defaultMessageNotifications: notif2, banner: banner2, description: desc2, splash: splash2, vanityURLCode: url2,
            features: features2, icon: icon2, verificationLevel: verLVL2, explicitContentFilter: expFilter2,
            mfaLevel: mfa2, widgetChannel: widgetChan2, widgetEnabled: widgetOn2, discoverySplash: discSplash2,
            publicUpdatesChannel: updateChan2, rulesChannel: rulesChan2, preferredLocale: lang2, nsfwLevel: nsfw2,
            partnered: partner2, premiumTier: boostLvl2, systemChannelFlags: sysChanFlags2, verified: verified2,
            maximumBitrate: maxBitrate2
        } = newGuild

        const imgOptions = { dynamic: true, size: 1024 }

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated server', newGuild.iconURL(imgOptions))
            .setTimestamp()

        const imagesEmbed = new MessageEmbed(embed)

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (desc1 !== desc2) {
            embed.addField('Description', stripIndent`
                **Before**
                ${desc1 || 'None'}
                **After**
                ${desc2 || 'None'}
            `)
        }

        if (icon1 !== icon2) {
            imagesEmbed.addField('Icon', stripIndent`
                **Before:** ${imageLink(oldGuild.iconURL(imgOptions), true)}
                **After:** ${imageLink(newGuild.iconURL(imgOptions))}
            `).setThumbnail(newGuild.iconURL(imgOptions))

            newGuild.queuedLogs.push(imagesEmbed)
        }

        if (ownerId1 !== ownerId2) {
            /** @type {User} */
            const owner1 = client.users.fetch(ownerId1).catch(() => null)
            /** @type {User} */
            const owner2 = client.users.fetch(ownerId1).catch(() => null)
            embed.addField('Owner', `${owner1.toString()} ${owner1.tag} ➜ ${owner2.toString()} ${owner2.tag}`)
        }

        if (sysChan1 !== sysChan2) {
            embed.addField(
                'System messages channel',
                `${sysChan1?.toString() || 'None'} ➜ ${sysChan2?.toString() || 'None'}`
            )
        }

        if (!arrayEquals(sysChanFlags1.toArray(), sysChanFlags2.toArray())) {
            const [disabledFlags, enabledFlags] = compareArrays(
                sysChanFlags1.toArray().map(feat => sysChannelFlags[feat.toString()]),
                sysChanFlags2.toArray().map(feat => sysChannelFlags[feat.toString()])
            )

            const enabled = enabledFlags.join(', ') ? stripIndent`
                **Enabled**
                ${enabledFlags.join(', ') || 'None'}
            ` : ''

            const disabled = disabledFlags.join(', ') ? stripIndent`
                **Disabled**
                ${disabledFlags.join(', ') || 'None'}
            ` : ''

            embed.addField('System channel options', `${enabled}\n${disabled}`)
        }

        if (afkChan1 !== afkChan2) {
            embed.addField('AFK channel', `${afkChan1?.toString() || 'None'} ➜ ${afkChan2?.toString() || 'None'}`)
        }

        if (afkTo1 !== afkTo2) {
            embed.addField(
                'AFK timeout',
                `${myMs(afkTo1 * 1000, { long: true })} ➜ ${myMs(afkTo2 * 1000, { long: true })}`
            )
        }

        if (notif1 !== notif2) {
            embed.addField(
                'Default notification settings',
                notif1 === 'ALL_MESSAGES' || notif1 === 0 ?
                    'All messages ➜ Only @mentions' : 'Only @mentions ➜ All messages'
            )
        }

        if (banner1 !== banner2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Banner',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.bannerURL(imgOptions), true)}
                    **After:** ${imageLink(newGuild.bannerURL(imgOptions))}
                `
            }]).setThumbnail(newGuild.bannerURL(imgOptions))

            newGuild.queuedLogs.push(imagesEmbed)
        }

        if (splash1 !== splash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Invite splash image',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.splashURL(imgOptions), true)}
                    **After:** ${imageLink(newGuild.splashURL(imgOptions))}
                `
            }]).setThumbnail(newGuild.splashURL(imgOptions))

            newGuild.queuedLogs.push(imagesEmbed)
        }

        if (url1 !== url2) embed.addField('Vanity URL code', `${url1 || 'None'} ➜ ${url2 || 'None'}`)

        if (!arrayEquals(features1, features2)) {
            const [addedFeat, removedFeat] = compareArrays(
                features1.map(feat => guildFeatures[feat.toString()]),
                features2.map(feat => guildFeatures[feat.toString()])
            )

            const added = addedFeat.join(', ') ? stripIndent`
                **Added**
                ${addedFeat.join(', ') || 'None'}
            ` : ''

            const removed = removedFeat.join(', ') ? stripIndent`
                **Removed**
                ${removedFeat.join(', ') || 'None'}
            ` : ''

            embed.addField('Features', `${added}\n${removed}`)
        }

        if (partner1 !== partner2) embed.addField('Partened', partner1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (verified1 !== verified2) embed.addField('Verified', verified1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (maxBitrate1 !== maxBitrate2) {
            embed.addField('Max. bitrate', maxBitrate1 / 1000 + 'kbps ➜ ' + maxBitrate2 / 1000 + 'kbps')
        }

        if (boostLvl1 !== boostLvl2) {
            embed.addField('Server boost level', `${removeUnderscores(boostLvl1)} ➜ ${removeUnderscores(boostLvl2)}`)
        }

        if (nsfw1 !== nsfw2) {
            embed.addField('NSFW level', `${nsfwLevels[nsfw1]} ➜ ${nsfwLevels[nsfw2]}`)
        }

        if (verLVL1 !== verLVL2) {
            embed.addField('Verification level', `${verificationLevels[verLVL1]} ➜ ${verificationLevels[verLVL2]}`)
        }

        if (expFilter1 !== expFilter2) {
            embed.addField('Explicit content filter', `${R18ContentFilter[expFilter1]} ➜ ${R18ContentFilter[expFilter2]}`)
        }

        if (mfa1 !== mfa2) {
            embed.addField('2FA requirement for moderation', mfa1 === 'NONE' ? 'Disabled ➜ Enabled' : 'Enabled ➜ Disabled')
        }

        if (widgetChan1 !== widgetChan2) {
            embed.addField('Widget channel', `${widgetChan1?.toString() || 'None'} ➜ ${widgetChan2?.toString() || 'None'}`)
        }

        if (widgetOn1 !== widgetOn2) embed.addField('Widget', widgetOn1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled')

        if (discSplash1 !== discSplash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Discovery splash image',
                value: stripIndent`
                    **Before:** ${imageLink(oldGuild.discoverySplashURL(imgOptions), true)}
                    **After:** ${imageLink(newGuild.discoverySplashURL(imgOptions))}
                `
            }]).setThumbnail(newGuild.discoverySplashURL(imgOptions))

            newGuild.queuedLogs.push(imagesEmbed)
        }

        if (updateChan1 !== updateChan2) {
            embed.addField(
                'Community updates channel',
                `${updateChan1?.toString() || 'None'} ➜ ${updateChan2?.toString() || 'None'}`
            )
        }

        if (rulesChan1 !== rulesChan2) {
            embed.addField(
                'Rules or Guildelines channel',
                `${rulesChan1?.toString() || 'None'} ➜ ${rulesChan2?.toString() || 'None'}`
            )
        }

        if (lang1 !== lang2) embed.addField('Primary language', `${locales.get(lang1)} ➜ ${locales.get(lang2)}`)

        if (embed.fields.length !== 0 || embed.description) {
            newGuild.queuedLogs.push(embed)
        }
    })
}