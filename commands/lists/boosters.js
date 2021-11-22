/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { generateEmbed, pluralize, abcOrder, basicEmbed } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class BoostersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'boosters',
            aliases: ['boosts'],
            group: 'lists',
            description: 'Displays a list of the members that have boosted the server.',
            guildOnly: true,
            slash: true
        })
    }

    /**
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction
        const members = guild.members.cache
        const boosters = members.filter(m => m.roles.premiumSubscriberRole)
            .sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`)

        if (boosters.length === 0) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no boosters in this server.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        await generateEmbed({ message, interaction }, boosters, {
            number: 20,
            authorName: `There's ${pluralize('booster', boosters.length)}`,
            useDescription: true
        })
    }
}