const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, docId } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { Document } = require('mongoose')
const { oneLine } = require('common-tags')

/** A command that can be run in a client */
module.exports = class DeleteWarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deletewarn',
            aliases: ['delwarn', 'delete-warn', 'del-warn'],
            group: 'mod-logs',
            description: 'Clear a single warning from a member.',
            details: oneLine`
                \`warning id\` has to be a valid warning id.
                To see all the warnings in this server use the \`warnings\` command.
            `,
            format: 'delwarn [warning id]',
            examples: [`delwarn ${docId()}`],
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            deprecated: true,
            replacing: 'delmodlog',
            args: [{
                key: 'warnId',
                label: 'warning id',
                prompt: 'What is the id of the warning that you want to delete?',
                type: 'string',
                max: 12
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.warnId The warning id of the document to delete
     */
    async run(message, { warnId }) {
        const { guildId } = message

        /** @type {Document} */
        const warn = await moderations.findOne({ guild: guildId, type: 'warn', _id: warnId })
        if (!warn) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That Id is either invalid or it does not exist.'
            }))
        }

        await warn.deleteOne()

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Deleted warning with id \`${warnId}\``
        }))
    }
}