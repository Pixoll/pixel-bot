const { Command, CommandoMessage, CommandGroup } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')
const { disabled } = require('../../utils/mongo/schemas')

module.exports = class toggle extends Command {
    constructor(client) {
        super(client, {
            name: 'toggle',
            group: 'utility',
            memberName: 'toggle',
            description: 'Toggles a command or group on/off.',
            format: 'toggle [command | group]',
            examples: ['toggle ban', 'toggle moderation'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            guarded: true,
            args: [{
                key: 'target',
                prompt: 'What command or group would you like to toggle?',
                type: 'command|group'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {Command|CommandGroup} args.target The command or group to toggle
     */
    async run(message, { target }) {
        const { guild } = message
        const isCommand = !target.commands
        const type = isCommand ? 'command' : 'group'

        if (target.guarded) return message.say(basicEmbed('red', 'cross', `That ${type} is guarded and cannot be disabled.`))

        const isEnabled = target.isEnabledIn(guild)
        const state = isEnabled ? 'disabled' : 'enabled'
        target.setEnabledIn(guild, !isEnabled)

        const data = await disabled.findOne({ guild: guild.id })

        if (!data) {
            const doc = isCommand ? {
                guild: guild.id,
                commands: isEnabled ? [target.name] : [],
                groups: []
            } : {
                guild: guild.id,
                commands: [],
                groups: isEnabled ? [target.id] : []
            }

            await new disabled(doc).save()
        }
        else {
            const doc = isEnabled ? {
                $push: isCommand ?
                    { commands: target.name } :
                    { groups: target.id }
            } : {
                $pull: isCommand ?
                    { commands: target.name } :
                    { groups: target.id }
            }

            await data.updateOne(doc)
        }

        message.say(basicEmbed('green', 'check', `The \`${target.id || target.name}\` ${type} has been ${state}.`))
    }
}