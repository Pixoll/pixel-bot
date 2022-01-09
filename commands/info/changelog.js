/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { generateEmbed, abcOrder, timestamp } = require('../../utils/functions')
const { CommandInstances } = require('../../command-handler/typings')
const { version } = require('../../package.json')
/* eslint-enable no-unused-vars */

const changelog = require('../../documents/changelog.json')
    .sort((a, b) => abcOrder(b.version, a.version))
    .map(log => {
        if (version < log.version) return null
        const changes = log.changes.length === 1 ? log.changes[0] :
            log.changes.map((change, i) => `**${i + 1}.** ${change}`).join('\n')
        const title = `Version ${log.version} - ${timestamp(log.timestamp, 'F') ?? 'No date specified'}`
        return { title, changes }
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
            keyTitle: { suffix: 'title' },
            keys: ['changes']
        })
    }
}
