/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { generateEmbed, abcOrder } = require('../../utils')
const { CommandInstances } = require('../../command-handler/typings')
const { version } = require('../../package.json')
/* eslint-enable no-unused-vars */

const changelog = require('../../documents/changelog.json')
    .sort((a, b) => abcOrder(b.version, a.version))
    .map(val => {
        if (version < val.version) return null
        const changes = val.changes.length === 1 ? val.changes[0] :
            val.changes.map((change, i) => `**${i + 1}.** ${change}`).join('\n')
        return { version: val.version, changes }
    })
    .filter(log => log)

/** A command that can be run in a client */
module.exports = class ChangelogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'changelog',
            group: 'info',
            description: 'Displays the changelog history of the bot.',
            guarded: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { user } = this.client

        await generateEmbed({ message, interaction }, changelog, {
            number: 5,
            authorName: `${user.username}'s changelog`,
            authorIconURL: user.displayAvatarURL({ dynamic: true }),
            title: 'Version ',
            keyTitle: { suffix: 'version' },
            keys: ['changes']
        })
    }
}