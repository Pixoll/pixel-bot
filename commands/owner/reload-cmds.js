/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { basicEmbed, confirmButtons } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ReloadCmdsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reload-cmds',
            aliases: ['reloadcmds', 'rcmds'],
            group: 'owner',
            description: 'Reloads commands of the bot, both slash and message commands.',
            format: stripIndent`
                rcmds all - Reloads **all** commands.
                rcmds slash - Reloads **slash** commands.
                rcmds message - Reloads **message** commands.
            `,
            ownerOnly: true,
            guarded: true,
            args: [
                {
                    key: 'which',
                    prompt: 'Which commands would you like to reload?',
                    type: 'string',
                    oneOf: ['all', 'slash', 'message', 'one']
                },
                {
                    key: 'command',
                    prompt: 'Which command would you like to reload?',
                    type: 'command',
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'all'|'slash'|'message'|'one'} args.which Which commands to reload
     * @param {Command} args.command The command to reload
     */
    async run({ message }, { which, command }) {
        const { application, registry, options, guilds } = this.client
        const { commands } = registry
        const guild = guilds.resolve(options.testGuild)

        const confirmed = await confirmButtons({ message }, `reload ${which} commands`)
        if (!confirmed) return

        switch (which) {
            case 'all': {
                const msgCommands = commands.filter(cmd => !cmd.slash).toJSON()
                for (const cmd of msgCommands) cmd.reload()
                const slashCommands = commands.filter(cmd => cmd.slash).toJSON()
                if (options.testGuild) {
                    const testCmds = slashCommands.filter(cmd => cmd.test).map(cmd => cmd._slashToAPI)
                    await guild.commands.set(testCmds)
                }
                const nonTestCmds = slashCommands.filter(cmd => !cmd.test).map(cmd => cmd._slashToAPI)
                await application.commands.set(nonTestCmds)
                break
            }
            case 'message': {
                const msgCommands = commands.filter(cmd => !cmd.slash).toJSON()
                for (const cmd of msgCommands) cmd.reload()
                break
            }
            case 'slash': {
                const slashCommands = commands.filter(cmd => cmd.slash).toJSON()
                if (options.testGuild) {
                    const guild = guilds.resolve(options.testGuild)
                    const testCmds = slashCommands.filter(cmd => cmd.test).map(cmd => cmd._slashToAPI)
                    await guild.commands.set(testCmds)
                }
                const nonTestCmds = slashCommands.filter(cmd => !cmd.test).map(cmd => cmd._slashToAPI)
                await application.commands.set(nonTestCmds)
                break
            }
            case 'one': {
                command.reload()
                const { _slashToAPI, test } = command
                const findCommand = cmd => cmd.name === (_slashToAPI || command).name
                await guild.commands.fetch()
                await application.commands.fetch()
                const guildCommand = guild.commands.cache.find(findCommand)
                if (guildCommand) {
                    await guild.commands.delete(guildCommand.id)
                    if (test) await guild.commands.create(_slashToAPI)
                }
                const clientCommand = application.commands.cache.find(findCommand)
                if (clientCommand) await application.commands.edit(clientCommand.id, _slashToAPI)
            }
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Reloaded ${which} commands.`
        }))
    }
}
