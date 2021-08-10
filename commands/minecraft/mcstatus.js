const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, MessageAttachment } = require('discord.js')
const { status: java, statusBedrock: bedrock } = require('minecraft-server-util')
const { remDiscFormat, basicEmbed } = require('../../utils/functions')
const { mcIP } = require('../../utils/mongodb-schemas')
const { stripIndent, oneLine } = require('common-tags')

/**
 * makes sure the port is a valid value
 * @param {number} port the port
 * @param {string} type the type of the server
 */
function validPort(port, type) {
    return port || (type === 'java' ? 25565 : 19132)
}

/**
 * gets the status of a java server
 * @param {string} ip the ip
 * @param {number} port the port
 */
async function getJavaStatus(ip, port) {
    const status = await java(ip, { port, timeout: 5000 }).catch(() => null)
    if (!status) return 'I couldn\'t find the server you were looking for.'

    // gets data from the status
    const { description, samplePlayers, onlinePlayers, maxPlayers, version, favicon, roundTripLatency } = status
    const playerList = samplePlayers?.map(({ name }) => `\`${name}\``).join(', ')

    // re-creates the server icon with a buffer
    const buffer = new Buffer.from(favicon.split(',')[1], 'base64')
    const icon = new MessageAttachment(buffer, 'icon.png')

    // creates the embed
    const serverInfo = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(`Minecraft server: ${ip}`, 'attachment://icon.png')
        .addField('Description', remDiscFormat(description.toRaw()))
        .setThumbnail('attachment://icon.png')
        .attachFiles(icon)
        .setTimestamp()

    // displays the player list if it exists
    if (playerList?.length >= 1) serverInfo.addField('Player list', playerList)

    // adds extra data to the embed
    serverInfo.addField('Information', stripIndent`
        **>** **Online players:** ${onlinePlayers}/${maxPlayers}
        **>** **Version:** ${version}
        **>** **Ping:** ${roundTripLatency}ms
    `)

    return serverInfo
}

/**
 * gets the status of a bedrock server
 * @param {string} ip the ip
 * @param {number} port the port
 */
async function getBedrockStatus(ip, port) {
    const status = await bedrock(ip, { port, timeout: 5000 }).catch(() => null)
    if (!status) return 'I couldn\'t find the server you were looking for.'

    // gets data from the status
    const { motdLine1, motdLine2, onlinePlayers, maxPlayers, version, roundTripLatency } = status

    // creates the embed
    const serverInfo = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(`Minecraft server: ${ip}`)
        .addFields(
            {
                name: 'Description',
                value: `${remDiscFormat(motdLine1.toRaw())}\n${remDiscFormat(motdLine2.toRaw())}`
            },
            {
                name: 'Information',
                value: stripIndent`
                    **>** **Online players:** ${onlinePlayers}/${maxPlayers}
                    **>** **Version:** ${version}
                    **>** **Ping:** ${roundTripLatency}ms
                `
            }
        )
        .setTimestamp()

    return serverInfo
}

module.exports = class mcstatus extends Command {
    constructor(client) {
        super(client, {
            name: 'mcstatus',
            group: 'minecraft',
            memberName: 'mcstatus',
            description: 'Displays information from a Java/Bedrock Minecraft server.',
            details: stripIndent`
                \`ip\` has to be a valid server IP, and \`port\` a valid server port.
            `,
            format: stripIndent`
                mcstatus - Status of the saved Minecraft server.
                mcstatus java [ip] <port> - Status of a Java Minecraft server.
                mcstatus bedrock [ip] <port> - Status of a Bedrock Minecraft server.
                mcstatus save:java [ip] <port> - Saves a Java Minecraft server.
                mcstatus save:bedrock [ip] <port> - Saves a Bedrock Minecraft server.
            `,
            examples: ['mcstatus java play.hypixel.net', 'mcstatus bedrock play.hyperlandsmc.net', 'mcstatus save:java play.hypixel.net'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['java', 'bedrock', 'save:java', 'save:bedrock'],
                    default: ''
                },
                {
                    key: 'serverIP',
                    prompt: 'What is the IP of the server you want to save/look for?',
                    type: 'string',
                    default: ''
                },
                {
                    key: 'serverPort',
                    prompt: 'What is the port of the server you want to save/look for?',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.subCommand The sub-command
     * @param {string} args.serverIP The IP of the server to save
     * @param {number} args.serverPort The IP of the server to save
     */
    async run(message, { subCommand, serverIP, serverPort }) {
        // tries to get a saved server in the server where the command is used
        const document = await mcIP.findOne({ guild: message.guild.id })

        if (!subCommand) {
            if (!document) return message.say(basicEmbed('red', 'cross', 'You haven\'t saved a Minecraft server yet.'))

            // gets the type, ip and port of the saved server
            const { type, ip, port } = document

            // gets and sends the status of the server
            const response = type === 'java' ? await getJavaStatus(ip, port) : await getBedrockStatus(ip, port)

            if (typeof response === 'string') return message.say(basicEmbed('red', 'cross', response))
            return message.say(response)
        }

        if (subCommand.toLowerCase().startsWith('save')) {
            // only users with admin permissions can save a new Minecraft server address
            if (!message.member.permissions.has('ADMINISTRATOR')) {
                this.client.emit('commandBlock', message, 'permission', { missing: ['ADMINISTRATOR'] })
                return
            }

            if (!serverIP) return message.say(basicEmbed('red', 'cross', 'Please provide a server IP to save.'))

            // gets the type of the server and the port
            const type = subCommand.split(':').pop()
            const port = validPort(serverPort, type)

            // creates a document with the data of the Minecraft server
            const newDoc = {
                guild: message.guild.id,
                type: type,
                ip: serverIP,
                port: port
            }

            // updates the saved server
            if (!document) await new mcIP(newDoc).save()
            else await document.updateOne(newDoc)

            return message.say(basicEmbed('green', 'check', 'The Minecraft server address has been saved.', stripIndent`
                **>** IP: \`${serverIP}\`
                **>** Port: \`${port}\`
            `))
        }

        if (!serverIP) return message.say(basicEmbed('red', 'cross', 'Please provide a server IP to look for.'))

        // gets the type and port
        const type = subCommand.toLowerCase()
        const port = validPort(serverPort, type)

        // gets and sends the status of the server
        const response = type === 'java' ? await getJavaStatus(serverIP, port) : await getBedrockStatus(serverIP, port)

        if (typeof response === 'string') return message.say(basicEmbed('red', 'cross', response))
        message.say(response)
    }
}