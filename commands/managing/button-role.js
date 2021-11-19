/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { TextChannel, Role, MessageButton, MessageActionRow, MessageEmbed } = require('discord.js')
const {
    channelDetails, basicCollector, myMs, roleDetails, isValidRole, removeDuplicated, embedColor,
    basicEmbed
} = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ButtonRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'button-role',
            aliases: ['brole', 'buttonrole'],
            group: 'managing',
            description: 'Create or remove button roles.',
            details: `${channelDetails()}\n${roleDetails(null, true, 10)}`,
            format: 'buttonrole [channel] [roles]',
            examples: ['buttonrole #roles Giveaways, Polls'],
            userPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'On what channel do you want to create the button roles?',
                    type: 'text-channel'
                },
                {
                    key: 'roles',
                    prompt: 'What roles do you want to toggle for that member?',
                    type: 'string',
                    validate: async (val, msg, arg) => {
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 10)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            const con2 = isValidRole(msg, con1 === true ? await type.parse(str, msg) : null)
                            valid.push(con1 && con2)
                        }
                        const wrong = valid.filter(b => b !== true)
                        return wrong[0] === undefined
                    },
                    parse: async (val, msg) => {
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 10)
                        const valid = []
                        for (const str of array) {
                            valid.push(await type.parse(str, msg))
                        }
                        return removeDuplicated(valid)
                    },
                    error: 'At least one of the roles you specified was invalid, please try again.'
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The text channel of the button roles
     * @param {Role[]} args.roles The roles for the buttons
     */
    async run({ message }, { channel, roles }) {
        const { id } = message

        const msg = await basicCollector({ message }, {
            fieldName: 'What message should I send with the buttons?'
        }, { time: myMs('2m') })
        if (!msg) return

        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setDescription(msg.content)

        const buttons = []
        for (const role of roles) {
            const style = buttons.length >= 5 ? 'PRIMARY' : 'SECONDARY'
            const button = new MessageButton()
                .setCustomId(`button-role:${id}:${role.id}`)
                .setLabel(role.name)
                .setStyle(style)
            buttons.push(button)
        }

        const rows = []
        while (buttons.length > 0) {
            const toAdd = rows.length === 1 ? buttons.splice(0, buttons.length).map(b => b.setStyle('SECONDARY')) :
                buttons.splice(0, buttons.length <= 4 ? 4 : Math.round(buttons.length / 2 + 0.1))
                    .map(b => b.setStyle('PRIMARY'))

            const row = new MessageActionRow().addComponents(...toAdd)
            rows.push(row)
        }

        const { url } = await channel.send({ embeds: [embed], components: rows })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `The buttons roles were successfully created at [this message](${url}).`
        }))
    }
}