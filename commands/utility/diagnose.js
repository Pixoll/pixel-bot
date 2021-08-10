const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { Command, CommandoMessage, CommandGroup } = require('discord.js-commando')
const { capitalize } = require('../../utils/functions')

module.exports = class diagnose extends Command {
    constructor(client) {
        super(client, {
            name: 'diagnose',
            group: 'utility',
            memberName: 'diagnose',
            description: 'Diagnose any command or group to determine if they are disabled or not.',
            details: stripIndent`
                If \`name\` is not specified, the bot will display the disabled commands and groups in this server.
                \`name\` can be either a command's name or alias, or a group's name.
            `,
            format: 'diagnose <name>',
            examples: ['diagnose ban', 'diagnose moderation'],
            userPermissions: ['ADMINISTRATOR'],
            guarded: true,
            guildOnly: true,
            args: [{
                key: 'target',
                prompt: 'What command or group would you like to diagnose?',
                type: 'command|group',
                default: ''
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {Command|CommandGroup} args.target The command or group
     */
    async run(message, { target }) {
        const { guild } = message
        const { registry, user, commandPrefix } = this.client
        const { commands, groups } = registry
        const bot = guild.members.cache.get(user.id)
        const prefix = guild.commandPrefix || commandPrefix

        if (!target) {
            const commandsList = commands.filter(cmd => !cmd.isEnabledIn(guild, true)).map(({ name }) => `- ${name}`).sort()
            const groupsList = groups.filter(group => !group.isEnabledIn(guild)).map(({ name }) => `- ${name}`).sort()

            const commandsDisabled = commandsList.length < 1 ? 'There are no disabled commands' : commandsList.join('\n')
            const groupsDisabled = groupsList.length < 1 ? 'There are no disabled groups' : groupsList.join('\n')

            const disabled = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(`${guild.name}'s disabled commands and groups`, guild.iconURL({ dynamic: true }))
                .addFields(
                    {
                        name: 'Commands',
                        value: commandsDisabled,
                        inline: true
                    },
                    {
                        name: 'Groups',
                        value: groupsDisabled,
                        inline: true
                    }
                )
                .setTimestamp()

            return message.say(disabled)
        }

        const toDiagnose = target.groupID ? prefix + target.name : target.name
        const type = target.groupID ? 'command' : 'group'

        const diagnose = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Status of ${toDiagnose} ${type}`, guild.iconURL({ dynamic: true }))
            .addFields(
                {
                    name: 'Status',
                    value: target.isEnabledIn(guild, true) ? 'Enabled' : 'Disabled',
                    inline: true
                },
                {
                    name: 'Guarded',
                    value: target.guarded ? 'No' : 'Yes',
                    inline: true
                }
            )
            .setTimestamp()

        if (target.groupID) {
            const perms = target.clientPermissions
            const missing = perms?.filter(str => !bot.permissions.toArray(true).filter(str => perms?.includes(str)).includes(str))
            const permissions = missing?.map(perm => `\`${capitalize(perm.replace(/_/g, ' '))}\``).join(', ')

            diagnose.addField('Missing permissions', permissions || 'None')
        }

        message.say(diagnose)
    }
}