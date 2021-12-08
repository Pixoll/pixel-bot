/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { TextChannel, Role, MessageButton, MessageActionRow, MessageEmbed } = require('discord.js')
const { basicCollector, isValidRole, removeDuplicated, basicEmbed, replyAll } = require('../../utils/functions')
const ms = require('../../utils/ms')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ButtonRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'button-role',
            aliases: ['brole', 'buttonrole'],
            group: 'managing',
            description: 'Create or remove button roles.',
            details: stripIndent`
                \`channel\` can be either a channel's name, mention or id.
                \`roles\` can be all the roles' names, mentions or ids, separated by commas (max. 10 at once).
            `,
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
                    prompt: 'What roles do you want to set for the button roles?',
                    type: 'string',
                    validate: async (val, msg, arg) => {
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 10)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            if (!con1) valid.push(false)
                            const con2 = isValidRole(msg, await type.parse(str, msg))
                            valid.push(con2)
                        }
                        return valid.filter(b => b !== true).length !== array.length
                    },
                    parse: async (val, msg, arg) => {
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 10)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            if (!con1) continue
                            const role = await type.parse(str, msg)
                            const con2 = isValidRole(msg, role)
                            if (!con2) continue
                            valid.push(role)
                        }
                        return removeDuplicated(valid)
                    },
                    error: 'None of the roles you specified were valid. Please try again.'
                }
            ],
            slash: {
                options: [
                    {
                        type: 'channel',
                        channelTypes: ['guild-text', 'guild-news'],
                        name: 'channel',
                        description: 'The channel where to create the button roles.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'message',
                        description: 'The message for these button roles.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'roles',
                        description: 'The roles for the button roles, separated by commas.',
                        required: true
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The text channel of the button roles
     * @param {Role[]} args.roles The roles for the buttons
     */
    async run({ message, interaction }, { channel, roles, message: content }) {
        const intMsg = await interaction?.fetchReply()

        if (interaction) {
            const arg = this.argsCollector.args[1]
            const isValid = await arg.validate(roles, intMsg, arg)
            if (isValid !== true) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: arg.error
                }))
            }
            roles = await arg.parse(roles, intMsg, arg)
        }

        const { id } = message || intMsg

        if (message) {
            const msg = await basicCollector({ message }, {
                fieldName: 'What message should I send with the buttons?'
            }, { time: ms('2m') })
            if (!msg) return
            content = msg.content
        }

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setDescription(content)

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

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `The buttons roles were successfully created [here](${url}).`
        }))
    }
}