const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')
const { afk: afkDocs } = require('../../utils/mongo/schemas')
const { stripIndent, oneLine } = require('common-tags')

module.exports = class afk extends Command {
    constructor(client) {
        super(client, {
            name: 'afk',
            group: 'misc',
            memberName: 'afk',
            description: 'Set an AFK status to display when you are mentioned.',
            details: oneLine`
                When using the command, \`status\` will be saved so when you get mentioned at any time, that \`status\`
                will be sent. If instead of providing an \`status\` you send \`off\`, I will remove you AFK status.
            `,
            format: stripIndent`
                afk [status] - Set your status.
                afk off - Remove your status.
            `,
            examples: ['afk Coding', 'afk off'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'status',
                prompt: 'What is the status you want to set? Type `off` to remove it.',
                type: 'string',
                max: 512
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.status The status to set or `off`
     */
    async run(message, { status }) {
        // gets data that will be used later
        const { author } = message
        const guildID = message.guild.id

        // tries to get the AFK status if it exists
        const getAFK = await afkDocs.findOne({ guild: guildID, user: author.id })

        if (getAFK) {
            if (status.toLowerCase() === 'off') {
                // removes the AFK status
                await getAFK.deleteOne()

                return message.say(basicEmbed('green', '', `Welcome back ${author}, I removed your AFK status`))
                    .then(msg => msg.delete({ timeout: 10000 }).catch(() => null))
            }

            // updates the AFK status
            await getAFK.updateOne({ status: status })

            return message.say(basicEmbed('green', 'check', 'I updated your AFK status to:', status))
        }

        if (status.toLowerCase() === 'off') return message.say(basicEmbed('red', 'cross', 'You can\'t set your status as `off`'))

        // creates a new document
        const doc = {
            guild: guildID,
            user: author.id,
            status: status
        }

        // saves the AFK status
        await new afkDocs(doc).save()

        message.say(basicEmbed('green', 'check', 'I set your AFK status as:', status))
    }
}