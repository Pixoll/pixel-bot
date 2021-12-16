/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageEmbed, PremiumTier } = require('discord.js')
const { replyAll } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/** @param {string[]} arr */
function sliceEmojis(arr) {
    const dummy = []
    const normal = []
    for (const emoji of arr) {
        if (dummy.join(' ').length + emoji.length + 1 > 1024) {
            normal.push(dummy)
            dummy.splice(0, dummy.length)
        }
        dummy.push(emoji)
    }
    normal.push(dummy)
    return normal
}

/**
 * Parses the emoji tier into the maximum emojis.
 * @param {PremiumTier} tier The tier to parse.
 */
function parseEmojiTier(tier) {
    switch (tier) {
        case 'NONE': return 50
        case 'TIER_1': return 100
        case 'TIER_2': return 150
        case 'TIER_3': return 250
    }
}

/** A command that can be run in a client */
module.exports = class EmojisCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'emojis',
            group: 'lists',
            description: 'Displays a list of server emojis.',
            details: 'If the amount of emojis is too big, I will only display the maximum amount I\'m able to.',
            guildOnly: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction
        const _emojis = await guild.emojis.fetch()
        const maxEmojis = parseEmojiTier(guild.premiumTier)

        const emojis = _emojis.map(emoji => ({
            animated: emoji.animated,
            string: emoji.toString()
        }))

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s emojis`, guild.iconURL({ dynamic: true }))

        const notAnimated = emojis.filter(e => !e.animated).map(e => e.string)
        const isAnimated = emojis.filter(e => e.animated).map(e => e.string)

        const normal = sliceEmojis(notAnimated)
        const animated = sliceEmojis(isAnimated)

        embed.addField(
            `Normal emojis: ${notAnimated.length}/${maxEmojis}`,
            normal.shift().join(' ') || 'No emojis found.'
        )
        while (normal.length !== 0) {
            embed.addField('\u2800', normal.shift().join(' '))
        }

        embed.addField(
            `Animated emojis: ${isAnimated.length}/${maxEmojis}`,
            animated.shift().join(' ') || 'No emojis found.'
        )
        while (animated.length !== 0) {
            embed.addField('\u2800', animated.shift().join(' '))
        }

        await replyAll({ message, interaction }, embed)
    }
}
