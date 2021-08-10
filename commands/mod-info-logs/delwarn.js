const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongodb-schemas')

module.exports = class delwarn extends Command {
    constructor(client) {
        super(client, {
            name: 'delwarn',
            group: 'mod',
            memberName: 'delwarn',
            description: 'Clear a single warning from a member.',
            details: '`warning ID` has to be a valid warning ID. To see all the warnings in this server use the `warnings` command.',
            format: 'delwarn [warning ID]',
            examples: ['delwarn aa2be4fab2d1'],
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'warningID',
                prompt: 'What is the ID of the warning that you want to delete?',
                type: 'string',
                max: 12
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.warningID The warning ID
     */
    async run(message, { warningID }) {
        // tries to get the warn
        const warn = await moderations.findOne({ guild: message.guild.id, type: 'warn', _id: warningID })
        if (!warn) return message.say(basicEmbed('red', 'cross', 'That ID is either invalid or it does not exist.'))

        // deletes the warn
        await warn.deleteOne()

        message.say(basicEmbed('green', 'check', `Deleted warning with ID \`${warningID}\``))
    }
}