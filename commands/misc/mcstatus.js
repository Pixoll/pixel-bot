/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, MessageAttachment, MessageOptions } = require('discord.js')
const { status: statusJava, statusBedrock } = require('minecraft-server-util')
const { StatusResponse, BedrockStatusResponse } = require('minecraft-server-util/dist/model/StatusResponse')
const { basicEmbed, getArgument, remDiscFormat, noReplyInDMs } = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

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
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'check'|'java'|'bedrock'|'save:java'|'save:bedrock'} args.subCommand The sub-command
     * @param {string} args.ip The IP of the server to save/look for
     * @param {number} args.port The IP of the server to save/look for
     */
    async run(message, { subCommand, ip, port }) {
        subCommand = subCommand.toLowerCase()
        const { guild } = message
        this.db = guild.database.mcIps

        switch (subCommand) {
            case 'check':
                return await this.check(message)
            case 'java':
                return await this.java(message, ip, port || 25565)
            case 'bedrock':
                return await this.bedrock(message, ip, port || 19132)
            case 'save:java':
                return await this.saveJava(message, ip, port || 25565)
            case 'save:bedrock':
                return await this.saveBedrock(message, ip, port || 19132)
        }
    }

    /**
     * The `check` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async check(message) {
        if (!message.guild) {
            return await this.onBlock(message, 'guildOnly')
        }

        const savedServer = await this.db.fetch()

        if (!savedServer) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: 'Please run the `save:java` or `save:bedrock` sub-commands before using this.'
            }))
        }

        const { type, ip, port } = savedServer

        const response = type === 'java' ?
            await this.getJavaStatus(ip, port) :
            await this.getBedrockStatus(ip, port)

        if (response instanceof MessageEmbed) {
            return await message.replyEmbed(response)
        }
        await message.reply({ ...response, ...noReplyInDMs(message) })
    }

    /**
     * The `java` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string} ip The IP of the Java server to look for
     * @param {number} port The port of the Java server to look for
     */
    async java(message, ip, port) {
        if (!ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            ip = value
        }

        const response = await this.getJavaStatus(ip, port)
        if (response instanceof MessageEmbed) {
            return await message.replyEmbed(response)
        }
        await message.reply({ ...response, ...noReplyInDMs(message) })
    }

    /**
     * The `bedrock` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string} ip The IP of the Bedrock server to look for
     * @param {number} port The port of the Bedrock server to look for
     */
    async bedrock(message, ip, port) {
        if (!ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            ip = value
        }

        const response = await this.getBedrockStatus(ip, port)
        await message.replyEmbed(response)
    }

    /**
     * The `save-java` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string} ip The IP of the Java server to save
     * @param {number} port The port of the Java server to save
     */
    async saveJava(message, ip, port) {
        const { guildId, member } = message
        const { permissions } = member

        if (!this.client.isOwner(message) && !permissions.has('ADMINISTRATOR')) {
            return await this.onBlock(message, 'userPermissions', { missing: ['ADMINISTRATOR'] })
        }

        if (!ip) {
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

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `
        }))
    }

    /**
     * The `save-bedrock` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string} ip The IP of the Bedrock server to save
     * @param {number} port The port of the Bedrock server to save
     */
    async saveBedrock(message, ip, port) {
        const { guildId, member } = message

        if (!this.client.isOwner(message) && !member.permissions.has('ADMINISTRATOR')) {
            return await this.onBlock(message, 'userPermissions', { missing: ['ADMINISTRATOR'] })
        }

        if (!ip) {
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

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `
        }))
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