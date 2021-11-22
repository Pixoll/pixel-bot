/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances, CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, MessageAttachment, MessageOptions } = require('discord.js')
const { status: statusJava, statusBedrock } = require('minecraft-server-util')
const { StatusResponse, BedrockStatusResponse } = require('minecraft-server-util/dist/model/StatusResponse')
const { basicEmbed, getArgument, remDiscFormat, noReplyInDMs } = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

const optionsLook = [
    { type: 'string', name: 'ip', description: 'The IP of the server to look for.', required: true },
    { type: 'integer', name: 'port', description: 'The port of the server to look for.', /* minValue: 1, maxValue: 65535 */ }
]

const optionsSave = [
    { type: 'string', name: 'ip', description: 'The IP of the server to save.', required: true },
    { type: 'integer', name: 'port', description: 'The port of the server to save.', /* minValue: 1, maxValue: 65535 */ }
]

/** A command that can be run in a client */
module.exports = class McStatusCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mcstatus',
            group: 'misc',
            description: 'Displays information of a Java/Bedrock Minecraft server.',
            details: '`ip` has to be a valid server IP, and `port` a valid server port.',
            format: stripIndent`
                mcstatus <check> - Status of the saved server.
                mcstatus java [ip] <port> - Status of a Java server.
                mcstatus bedrock [ip] <port> - Status of a Bedrock server.
                mcstatus save:java [ip] <port> - Saves a Java server.
                mcstatus save:bedrock [ip] <port> - Saves a Bedrock server.
            `,
            examples: [
                'mcstatus java play.hypixel.net',
                'mcstatus bedrock play.hyperlandsmc.net',
                'mcstatus save:java play.hypixel.net'
            ],
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['check', 'java', 'bedrock', 'save:java', 'save:bedrock'],
                    default: 'check'
                },
                {
                    key: 'ip',
                    prompt: 'What is the IP of the server you want to save/look for?',
                    type: 'string',
                    required: false
                },
                {
                    key: 'port',
                    prompt: 'What is the port of the server you want to save/look for?',
                    type: 'integer',
                    min: 1,
                    max: 65535,
                    required: false
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'check',
                        description: 'Status of the saved server.'
                    },
                    {
                        type: 'subcommand',
                        name: 'java',
                        description: 'Status of a Java server.',
                        options: optionsLook
                    },
                    {
                        type: 'subcommand',
                        name: 'bedrock',
                        description: 'Status of a Bedrock server.',
                        options: optionsLook
                    },
                    {
                        type: 'subcommand',
                        name: 'save-java',
                        description: 'Saves a Java server.',
                        options: optionsSave
                    },
                    {
                        type: 'subcommand',
                        name: 'save-bedrock',
                        description: 'Saves a Bedrock server.',
                        options: optionsSave
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'check'|'java'|'bedrock'|'save:java'|'save:bedrock'} args.subCommand The sub-command
     * @param {string} args.ip The IP of the server to save/look for
     * @param {number} args.port The IP of the server to save/look for
     */
    async run({ message, interaction }, { subCommand, ip, port }) {
        subCommand = subCommand.replace('_', ':').toLowerCase()
        const { guild } = message || interaction
        this.db = guild.database.mcIps

        switch (subCommand) {
            case 'check':
                return await this.check({ message, interaction })
            case 'java':
                return await this.java({ message, interaction }, ip, port ?? 25565)
            case 'bedrock':
                return await this.bedrock({ message, interaction }, ip, port ?? 19132)
            case 'save:java':
                return await this.saveJava({ message, interaction }, ip, port ?? 25565)
            case 'save:bedrock':
                return await this.saveBedrock({ message, interaction }, ip, port ?? 19132)
        }
    }

    /**
     * The `check` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async check({ message, interaction }) {
        if (!(message || interaction).guild) {
            return await this.onBlock({ message, interaction }, 'guildOnly')
        }

        const savedServer = await this.db.fetch()

        if (!savedServer) {
            const embed = basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: 'Please run the `save:java` or `save:bedrock` sub-commands before using this.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const { type, ip, port } = savedServer

        const response = type === 'java' ?
            await this.getJavaStatus(ip, port) :
            await this.getBedrockStatus(ip, port)

        if (response instanceof MessageEmbed) {
            await interaction?.editReply({ embeds: [response] })
            await message?.replyEmbed(response)
            return
        }
        await interaction?.editReply(response)
        await message?.reply({ ...response, ...noReplyInDMs(message) })
    }

    /**
     * The `java` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Java server to look for
     * @param {number} port The port of the Java server to look for
     */
    async java({ message, interaction }, ip, port) {
        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            ip = value
        }

        const response = await this.getJavaStatus(ip, port)
        if (response instanceof MessageEmbed) {
            await interaction?.editReply({ embeds: [response] })
            await message?.replyEmbed(response)
            return
        }
        await interaction?.editReply(response)
        await message?.reply({ ...response, ...noReplyInDMs(message) })
    }

    /**
     * The `bedrock` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Bedrock server to look for
     * @param {number} port The port of the Bedrock server to look for
     */
    async bedrock({ message, interaction }, ip, port) {
        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            ip = value
        }

        const response = await this.getBedrockStatus(ip, port)
        await interaction?.editReply({ embeds: [response] })
        await message?.replyEmbed(response)
    }

    /**
     * The `save-java` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Java server to save
     * @param {number} port The port of the Java server to save
     */
    async saveJava({ message, interaction }, ip, port) {
        const { guildId, member } = message || interaction
        const { permissions } = member

        if (!this.client.isOwner(message || interaction.user) && !permissions.has('ADMINISTRATOR')) {
            return await this.onBlock({ message, interaction }, 'userPermissions', { missing: ['ADMINISTRATOR'] })
        }

        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            ip = value
        }

        await this.db.add({
            guild: guildId,
            type: 'java',
            ip: ip,
            port: port
        })

        const embed = basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }

    /**
     * The `save-bedrock` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Bedrock server to save
     * @param {number} port The port of the Bedrock server to save
     */
    async saveBedrock({ message, interaction }, ip, port) {
        const { guildId, member } = message || interaction
        const { permissions } = member

        if (!this.client.isOwner(message || interaction.user) && !permissions.has('ADMINISTRATOR')) {
            return await this.onBlock({ message, interaction }, 'userPermissions', { missing: ['ADMINISTRATOR'] })
        }

        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            ip = value
        }

        await this.db.add({
            guild: guildId,
            type: 'bedrock',
            ip: ip,
            port: port
        })

        const embed = basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }

    /**
     * Gets the status of a Java server
     * @param {string} ip The IP of the server to look for
     * @param {number} port the port of the server to look for
     */
    async getJavaStatus(ip, port) {
        /** @type {StatusResponse} */
        const status = await statusJava(ip, { port, timeout: 5000 }).catch(() => null)
        if (!status) {
            return basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the server you were looking for.'
            })
        }

        const { description, samplePlayers, onlinePlayers, maxPlayers, version, favicon, roundTripLatency, host } = status

        // Server favicon
        const buffer = favicon ? new Buffer.from(favicon.split(',')[1], 'base64') : null
        const icon = buffer ? new MessageAttachment(buffer, 'icon.png') : null

        const serverInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Server IP: ${host}`, 'attachment://icon.png')
            .addField('Description', remDiscFormat(description.toRaw()))
            .setThumbnail('attachment://icon.png')
            .setTimestamp()

        if (samplePlayers?.length > 0) {
            serverInfo.addField(
                'Player list',
                samplePlayers.map(p => `\`${p.name}\``).join(', ')
            )
        }

        serverInfo.addField('Information', stripIndent`
            **>** **Online players:** ${onlinePlayers}/${maxPlayers}
            **>** **Version:** ${version}
            **>** **Ping:** ${roundTripLatency}ms
        `)

        /** @type {MessageOptions} */
        const options = {
            embeds: [serverInfo],
            files: [icon].filter(a => a)
        }

        return options
    }

    /**
     * Gets the status of a Bedrock server
     * @param {string} ip The IP of the server to look for
     * @param {number} port the port of the server to look for
     */
    async getBedrockStatus(ip, port) {
        /** @type {BedrockStatusResponse} */
        const status = await statusBedrock(ip, { port, timeout: 5000 }).catch(() => null)
        if (!status) {
            return basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the server you were looking for.'
            })
        }

        const { motdLine1, motdLine2, onlinePlayers, maxPlayers, version, roundTripLatency, host } = status

        const serverInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Server IP: ${host}`)
            .addField('Description', stripIndent`
                ${remDiscFormat(motdLine1.toRaw())}
                ${remDiscFormat(motdLine2.toRaw())}
            `)
            .addField('Information', stripIndent`
                **Online players:** ${onlinePlayers}/${maxPlayers}
                **Version:** ${version}
                **Ping:** ${roundTripLatency}ms
            `)
            .setTimestamp()

        return serverInfo
    }
}