/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { MessageEmbed, MessageAttachment, MessageOptions, Util } = require('discord.js');
const { status: statusJava, statusBedrock } = require('minecraft-server-util');
const { basicEmbed, getArgument, replyAll } = require('../../utils/functions');
const { stripIndent } = require('common-tags');
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
                mcstatus save-java [ip] <port> - Saves a Java server.
                mcstatus save-bedrock [ip] <port> - Saves a Bedrock server.
            `,
            examples: [
                'mcstatus java play.hypixel.net',
                'mcstatus bedrock play.hyperlandsmc.net',
                'mcstatus save-java play.hypixel.net'
            ],
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['check', 'java', 'bedrock', 'save-java', 'save-bedrock'],
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
                        options: [
                            {
                                type: 'string',
                                name: 'ip',
                                description: 'The IP of the server to look for.',
                                required: true
                            },
                            {
                                type: 'integer',
                                name: 'port',
                                description: 'The port of the server to look for.',
                                minValue: 1,
                                maxValue: 65535
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'bedrock',
                        description: 'Status of a Bedrock server.',
                        options: [
                            {
                                type: 'string',
                                name: 'ip',
                                description: 'The IP of the server to look for.',
                                required: true
                            },
                            {
                                type: 'integer',
                                name: 'port',
                                description: 'The port of the server to look for.',
                                minValue: 1,
                                maxValue: 65535
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'save-java',
                        description: 'Saves a Java server.',
                        options: [
                            {
                                type: 'string',
                                name: 'ip',
                                description: 'The IP of the server to save.',
                                required: true
                            },
                            {
                                type: 'integer',
                                name: 'port',
                                description: 'The port of the server to save.',
                                minValue: 1,
                                maxValue: 65535
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'save-bedrock',
                        description: 'Saves a Bedrock server.',
                        options: [
                            {
                                type: 'string',
                                name: 'ip',
                                description: 'The IP of the server to save.',
                                required: true
                            },
                            {
                                type: 'integer',
                                name: 'port',
                                description: 'The port of the server to save.',
                                minValue: 1,
                                maxValue: 65535
                            }
                        ]
                    }
                ]
            }
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'check'|'java'|'bedrock'|'save-java'|'save-bedrock'} args.subCommand The sub-command
     * @param {string} args.ip The IP of the server to save/look for
     * @param {number} args.port The IP of the server to save/look for
     */
    async run({ message, interaction }, { subCommand, ip, port }) {
        subCommand = subCommand.toLowerCase();
        const { guild } = message || interaction;
        this.db = guild?.database.mcIps;

        switch (subCommand) {
            case 'check':
                return await this.check({ message, interaction });
            case 'java':
                return await this.java({ message, interaction }, ip, port ?? 25565);
            case 'bedrock':
                return await this.bedrock({ message, interaction }, ip, port ?? 19132);
            case 'save-java':
                return await this.saveJava({ message, interaction }, ip, port ?? 25565);
            case 'save-bedrock':
                return await this.saveBedrock({ message, interaction }, ip, port ?? 19132);
        }
    }

    /**
     * The `check` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async check({ message, interaction }) {
        if (!(message || interaction).guild) {
            return await this.onBlock({ message, interaction }, 'guildOnly');
        }

        const savedServer = await this.db.fetch();

        if (!savedServer) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: 'Please run the `save:java` or `save:bedrock` sub-commands before using this.'
            }));
        }

        const { type, ip, port } = savedServer;

        const response = type === 'java' ?
            await this.getJavaStatus(ip, port) :
            await this.getBedrockStatus(ip, port);

        await replyAll({ message, interaction }, response);
    }

    /**
     * The `java` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Java server to look for
     * @param {number} port The port of the Java server to look for
     */
    async java({ message, interaction }, ip, port) {
        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
            if (cancelled) return;
            ip = value;
        }

        const response = await this.getJavaStatus(ip, port);
        await replyAll({ message, interaction }, response);
    }

    /**
     * The `bedrock` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Bedrock server to look for
     * @param {number} port The port of the Bedrock server to look for
     */
    async bedrock({ message, interaction }, ip, port) {
        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
            if (cancelled) return;
            ip = value;
        }

        const response = await this.getBedrockStatus(ip, port);
        await replyAll({ message, interaction }, response);
    }

    /**
     * The `save-java` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Java server to save
     * @param {number} port The port of the Java server to save
     */
    async saveJava({ message, interaction }, ip, port) {
        const { guildId, member } = message || interaction;
        const { permissions } = member;

        if (!guildId) {
            return await this.onBlock({ message, interaction }, 'guildOnly');
        }

        if (!this.client.isOwner(message || interaction.user) && !permissions.has('ADMINISTRATOR')) {
            return await this.onBlock({ message, interaction }, 'userPermissions', { missing: ['ADMINISTRATOR'] });
        }

        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
            if (cancelled) return;
            ip = value;
        }

        await this.db.add({
            guild: guildId,
            type: 'java',
            ip: ip,
            port: port
        });

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `
        }));
    }

    /**
     * The `save-bedrock` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} ip The IP of the Bedrock server to save
     * @param {number} port The port of the Bedrock server to save
     */
    async saveBedrock({ message, interaction }, ip, port) {
        const { guildId, member } = message || interaction;
        const { permissions } = member;

        if (!guildId) {
            return await this.onBlock({ message, interaction }, 'guildOnly');
        }

        if (!this.client.isOwner(message || interaction.user) && !permissions.has('ADMINISTRATOR')) {
            return await this.onBlock({ message, interaction }, 'userPermissions', { missing: ['ADMINISTRATOR'] });
        }

        if (message && !ip) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
            if (cancelled) return;
            ip = value;
        }

        await this.db.add({
            guild: guildId,
            type: 'bedrock',
            ip: ip,
            port: port
        });

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `
        }));
    }

    /**
     * Gets the status of a Java server
     * @param {string} ip The IP of the server to look for
     * @param {number} port the port of the server to look for
     * @returns {Promise<MessageEmbed|MessageOptions>}
     */
    async getJavaStatus(ip, port) {
        const reqStart = Date.now();
        let status;
        try {
            status = await statusJava(ip, port);
        } catch {
            return basicEmbed({
                color: 'RED',
                emoji: 'cross',
                fieldName: 'The server you were looking for is either offline or it doesn\'t exist',
                fieldValue: stripIndent`
                    **IP:** \`${ip}\`
                    **Port:** \`${port}\`
                `,
            });
        }

        const ping = Date.now() - reqStart;
        const { motd, version, favicon, players } = status;

        // Server favicon
        // eslint-disable-next-line new-cap
        const buffer = favicon ? new Buffer.from(favicon.split(',')[1], 'base64') : null;
        const icon = buffer ? new MessageAttachment(buffer, 'icon.png') : null;

        const serverInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `Server IP: ${ip}`, iconURL: 'attachment://icon.png'
            })
            .addField('MOTD', Util.escapeMarkdown(motd.clean.trimStart()))
            .setThumbnail('attachment://icon.png')
            .setTimestamp();

        if (players.sample?.length > 0) {
            serverInfo.addField(
                'Player list',
                players.sample.map(p => `\`${p.name}\``).join(', ')
            );
        }

        serverInfo.addField('Information', stripIndent`
            **Online players:** ${players.online}/${players.max}
            **Version:** ${version.name}
            **Ping:** ${ping}ms
        `);

        return {
            embeds: [serverInfo],
            files: [icon].filter(a => a)
        };
    }

    /**
     * Gets the status of a Bedrock server
     * @param {string} ip The IP of the server to look for
     * @param {number} port the port of the server to look for
     */
    async getBedrockStatus(ip, port) {
        const reqStart = Date.now();
        let status;
        try {
            status = await statusBedrock(ip, port);
        } catch {
            return basicEmbed({
                color: 'RED',
                emoji: 'cross',
                fieldName: 'The server you were looking for is either offline or it doesn\'t exist',
                fieldValue: stripIndent`
                    **IP:** \`${ip}\`
                    **Port:** \`${port}\`
                `
            });
        }

        const ping = Date.now() - reqStart;
        const { motd, players, version } = status;

        const serverInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor({ name: `Server IP: ${ip}` })
            .addField('MOTD', Util.escapeMarkdown(motd.clean.trimStart()))
            .addField('Information', stripIndent`
                **Online players:** ${players.online}/${players.max}
                **Version:** ${version.name}
                **Ping:** ${ping}ms
            `)
            .setTimestamp();

        return serverInfo;
    }
};
