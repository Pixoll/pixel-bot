const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { capitalize, arrayEqualsIgnoreOrder, formatPerm, moduleStatus, getLogsChannel } = require('../../utils/functions')
const { setup, modules } = require('../../utils/mongo/schemas')

/**
 * Compares and returns the difference between the set of permissions
 * @param {string[]} Old The old permissions
 * @param {string[]} New The new permissions
 */
function comparePerms(Old = [], New = []) {
    const arr1 = New.filter(perm => !Old.includes(perm))
    const arr2 = Old.filter(perm => !New.includes(perm))
    return [arr1, arr2]
}

/**
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 * @param {boolean} [old] If it's the old image
 */
function imageLink(link, old) {
    if (link) {
        if (old) return 'See thumbnail'
        return `[Click here](${link})`
    }
    return 'None'
}

/**
 * Handles all of the guild logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildUpdate', async (oldGuild, newGuild) => {
        const status = await moduleStatus(modules, oldGuild, 'auditLogs', 'server')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, oldGuild)
        if (!logsChannel) return

        const { name: name1, region: region1, systemChannel: sysChan1, afkChannel: afkChan1, afkTimeout: afkTO1,
            defaultMessageNotifications: notif1, banner: banner1, description: desc1, splash: splash1, vanityURLCode: url1,
            owner: owner1, features: features1, icon: icon1, verificationLevel: verLVL1, explicitContentFilter: expFilter1,
            mfaLevel: mfa1, widgetChannel: widgetChan1, widgetEnabled: widgetOn1, discoverySplash: discSplash1,
            publicUpdatesChannel: updateChan1, rulesChannel: rulesChan1, preferredLocale: language1, id
        } = oldGuild
        const { name: name2, region: region2, systemChannel: sysChan2, afkChannel: afkChan2, afkTimeout: afkTO2,
            defaultMessageNotifications: notif2, banner: banner2, description: desc2, splash: splash2, vanityURLCode: url2,
            owner: owner2, features: features2, icon: icon2, verificationLevel: verLVL2, explicitContentFilter: expFilter2,
            mfaLevel: mfa2, widgetChannel: widgetChan2, widgetEnabled: widgetOn2, discoverySplash: discSplash2,
            publicUpdatesChannel: updateChan2, rulesChannel: rulesChan2, preferredLocale: language2
        } = newGuild

        const imgOptions = { dynamic: true, size: 1024 }

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated server', oldGuild.iconURL(imgOptions))
            .setFooter(`Server ID: ${id}`)
            .setTimestamp()

        const imagesEmbed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated server', oldGuild.iconURL(imgOptions))
            .setFooter(`Server ID: ${id}`)
            .setTimestamp()

        // Overview
        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (desc1 !== desc2) embed.addField('Description', stripIndent`
            **Before**
            ${desc1 || 'None'}
            
            **After**
            ${desc2 || 'None'}
        `)

        if (icon1 !== icon2) {
            imagesEmbed.addField('Icon', stripIndent`
                **>** **Before:** ${imageLink(oldGuild.iconURL(imgOptions), true)}
                **>** **After:** ${imageLink(newGuild.iconURL(imgOptions))}
            `).setThumbnail(oldGuild.iconURL(imgOptions))

            logsChannel.send(imagesEmbed).catch(() => null)
        }

        if (owner1 !== owner2) embed.addField('Owner', `${owner1.toString()} ➜ ${owner2.toString()}`)

        if (region1 !== region2) embed.addField('Region', `${capitalize(region1)} ➜ ${capitalize(region2)}`)

        if (sysChan1 !== sysChan2) embed.addField('System channel', `${sysChan1?.toString() || 'None'} ➜ ${sysChan2?.toString() || 'None'}`)

        if (afkChan1 !== afkChan2) embed.addField('AFK channel', `${afkChan1?.toString() || 'None'} ➜ ${afkChan2?.toString() || 'None'}`)

        if (afkTO1 !== afkTO2) embed.addField('AFK timeout', `${afkTO1 / 60} minutes ➜ ${afkTO2 / 60} minutes`)

        if (notif1 !== notif2) embed.addField('Default notification settings', notif1 === 'ALL' ? 'All messages ➜ Mentions only' : 'Mentions only ➜ All messages')

        if (banner1 !== banner2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Banner', value: stripIndent`
                    **>** **Before:** ${imageLink(oldGuild.bannerURL(imgOptions), true)}
                    **>** **After:** ${imageLink(newGuild.bannerURL(imgOptions))}
                `
            }]).setThumbnail(oldGuild.bannerURL(imgOptions))

            logsChannel.send(imagesEmbed).catch(() => null)
        }

        if (splash1 !== splash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Invite splash image', value: stripIndent`
                    **>** **Before:** ${imageLink(oldGuild.splashURL(imgOptions), true)}
                    **>** **After:** ${imageLink(newGuild.splashURL(imgOptions))}
                `
            }]).setThumbnail(oldGuild.splashURL(imgOptions))

            logsChannel.send(imagesEmbed).catch(() => null)
        }

        if (url1 !== url2) embed.addField('Vanity URL code', `${url1 || 'None'} ➜ ${url2 || 'None'}`)

        if (!arrayEqualsIgnoreOrder(features1, features2)) {
            const [addedFeat, removedFeat] = comparePerms(features1.map(feat => formatPerm(feat)), features2.map(feat => formatPerm(feat)))

            const added = !!addedFeat.join(', ') ? stripIndent`
                **Added**
                ${addedFeat.join(', ') || 'None'}
            ` : ''

            const removed = !!removedFeat.join(', ') ? stripIndent`
                **Removed**
                ${removedFeat.join(', ') || 'None'}
            ` : ''

            embed.addField('Features', stripIndent`
                ${added}

                ${removed}
            `)
        }

        // Moderation
        if (verLVL1 !== verLVL2) embed.addField('Verification level', `${formatPerm(verLVL1)} ➜ ${formatPerm(verLVL2)}`)

        if (expFilter1 !== expFilter2) embed.addField('Explicit content filter', `${formatPerm(expFilter1)} ➜ ${formatPerm(expFilter2)}`)

        if (mfa1 !== mfa2) embed.addField('MFA level', mfa1 === 0 ? 'Disabled ➜ Enabled' : 'Enabled ➜ Disabled')

        // Widget
        if (widgetChan1 !== widgetChan2) embed.addField('Widget channel', `${widgetChan1?.toString() || 'None'} ➜ ${widgetChan2?.toString() || 'None'}`)

        if (widgetOn1 !== widgetOn2) embed.addField('widget', widgetOn1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled')

        // Community
        if (discSplash1 !== discSplash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Discovery splash image', value: stripIndent`
                    **>** **Before:** ${imageLink(oldGuild.discoverySplashURL(imgOptions), true)}
                    **>** **After:** ${imageLink(newGuild.discoverySplashURL(imgOptions))}
                `
            }]).setThumbnail(oldGuild.discoverySplashURL(imgOptions))

            logsChannel.send(imagesEmbed).catch(() => null)
        }

        if (updateChan1 !== updateChan2) embed.addField('Public updates channel', `${updateChan1?.toString() || 'None'} ➜ ${updateChan2?.toString() || 'None'}`)

        if (rulesChan1 !== rulesChan2) embed.addField('Rules channel', `${rulesChan1?.toString() || 'None'} ➜ ${rulesChan2?.toString() || 'None'}`)

        if (language1 !== language2) embed.addField('Preferred language', `${language1} ➜ ${language2}`)

        if (embed.fields.length !== 0 || embed.description) logsChannel.send(embed).catch(() => null)
    })
}