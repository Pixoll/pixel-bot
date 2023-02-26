/* eslint-disable no-unused-vars */
const { Command, CommandInstances, SetupSchema } = require('pixoll-commando');
const { stripIndent, oneLine } = require('common-tags');
const { basicEmbed, generateEmbed, pluralize, getArgument, confirmButtons, replyAll } = require('../../utils/functions');
const { TextChannel } = require('discord.js');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class LockdownCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lockdown',
            group: 'managing',
            description: 'Lock every text channel that was specified when using the `setup` command',
            details: stripIndent`
                If \`reason\` is not specified, it will default as "We'll be back shortly" or "Thanks for waiting".
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
            `,
            format: stripIndent`
                lockdown start <reason> - Start the lockdown.
                lockdown end <reason> - End the lockdown.
                lockdown channels - Display the lockdown channels.
                lockdown add [text-channels] - Add lockdown channels (max. 30 at once).
                lockdown remove [text-channels] - Remove lockdown channels (max. 30 at once).
            `,
            examples: [
                'lockdown add #chat commands 850477653252243466',
                'lockdown remove #commands 800224125444292608',
            ],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['start', 'end', 'channels', 'add', 'remove'],
                },
                {
                    key: 'channels',
                    prompt: oneLine`
                        Why are you starting/ending the lockdown? Or
                        what channels do you want to add or remove? (max. 30 at once)
                    `,
                    type: 'string',
                    validate: async (val, msg, arg) => {
                        if (typeof msg.parseArgs === 'function') {
                            const sc = msg.parseArgs().split(/ +/)[0].toLowerCase();
                            if (!['add', 'remove', 'channels'].includes(sc)) return true;
                        }
                        const type = msg.client.registry.types.get('text-channel');
                        const array = val.split(/ +/).slice(0, 30);
                        const valid = [];
                        for (const str of array) {
                            valid.push(await type.validate(str, msg, arg));
                        }
                        return valid.filter(b => b !== true).length !== array.length;
                    },
                    parse: async (val, msg, arg) => {
                        if (typeof msg.parseArgs === 'function') {
                            const sc = msg.parseArgs().split(/ +/)[0].toLowerCase();
                            if (!['add', 'remove', 'channels'].includes(sc)) return val || 'No reason given.';
                        }
                        const type = msg.client.registry.types.get('text-channel');
                        const array = val.split(/ +/).slice(0, 30);
                        const valid = [];
                        for (const str of array) {
                            const isValid = await type.validate(str, msg, arg);
                            if (!isValid) continue;
                            valid.push(await type.parse(str, msg));
                        }
                        return valid;
                    },
                    required: false,
                    error: 'None of the channels you specified were valid. Please try again.',
                },
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'start',
                        description: 'Start the lockdown',
                        options: [{
                            type: 'string',
                            name: 'reason',
                            description: 'Why are you starting the lockdown.',
                        }],
                    },
                    {
                        type: 'subcommand',
                        name: 'end',
                        description: 'End the lockdown',
                        options: [{
                            type: 'string',
                            name: 'reason',
                            description: 'Why are you ending the lockdown.',
                        }],
                    },
                    {
                        type: 'subcommand-group',
                        name: 'channels',
                        description: 'View, add or remove lockdown channels.',
                        options: [
                            {
                                type: 'subcommand',
                                name: 'add',
                                description: 'Add lockdown channels (max. 30 at once).',
                                options: [{
                                    type: 'string',
                                    name: 'channels',
                                    description: 'The channels to add, separated by spaces.',
                                    required: true,
                                }],
                            },
                            {
                                type: 'subcommand',
                                name: 'remove',
                                description: 'Remove lockdown channels (max. 30 at once).',
                                options: [{
                                    type: 'string',
                                    name: 'channels',
                                    description: 'The channels to remove, separated by spaces.',
                                    required: true,
                                }],
                            },
                            {
                                type: 'subcommand',
                                name: 'view',
                                description: 'Display the lockdown channels.',
                            },
                        ],
                    },
                ],
            },
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'start'|'end'|'channels'|'add'|'remove'|'view'} args.subCommand The sub-command
     * @param {string|TextChannel[]} args.channels The reason of the lockdown, or the channels to add/remove
     * @param {string} reason The reason of the lockdown
     */
    async run({ message, interaction }, { subCommand, channels, reason }) {
        if (interaction && channels) {
            const arg = this.argsCollector.args[1];
            const msg = await interaction.fetchReply();
            const isValid = await arg.validate(channels, msg);
            if (isValid !== true) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: arg.error,
                }));
            }
            channels = await arg.parse(channels, msg);
        }

        const { guild } = message || interaction;
        this.db = guild.database.setup;
        const _channels = guild.channels;
        subCommand = subCommand.toLowerCase();

        const data = await this.db.fetch();

        const savedChannels = [];
        if (data) {
            for (const channelId of data.lockChannels) {
                /** @type {TextChannel} */
                const channel = await _channels.fetch(channelId).catch(() => null);
                if (!channel) continue;
                savedChannels.push(channel);
            }
        }

        switch (subCommand) {
            case 'start':
                return await this.start({ message, interaction }, savedChannels, channels || reason);
            case 'end':
                return await this.end({ message, interaction }, savedChannels, channels || reason);
            case 'channels':
            case 'view':
                return await this.channels({ message, interaction }, savedChannels);
            case 'add':
                return await this.add({ message, interaction }, data, savedChannels.map(c => c.id), channels);
            case 'remove':
                return await this.remove({ message, interaction }, data, savedChannels.map(c => c.id), channels);
        }
    }

    /**
     * The `start` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TextChannel[]} savedChannels The saved lockdown channels of the server
     * @param {string} reason The reason of the lockdown
     */
    async start({ message, interaction }, savedChannels, reason) {
        if (savedChannels.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
        }
        reason ??= 'We\'ll be back shortly.';

        const confirmed = await confirmButtons({ message, interaction }, 'start lockdown', null, { reason });
        if (!confirmed) return;

        const { guild, guildId } = message || interaction;
        const { everyone } = guild.roles;

        const locking = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Locking all lockdown channels, please wait...',
        });
        const toDelete = await message?.replyEmbed(locking);
        await replyAll({ interaction }, locking);

        let amount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (perms?.deny.has('SEND_MESSAGES')) continue;

            await permsManager.edit(everyone, { SEND_MESSAGES: false }, { reason, type: 0 });
            await channel.send({
                embeds: [basicEmbed({
                    emoji: '\\🔒', fieldName: 'This channel has been locked', fieldValue: reason,
                })],
            });
            amount++;
        }

        await toDelete?.delete().catch(() => null);
        await message?.channel.sendTyping().catch(() => null);

        if (amount === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'GOLD', description: 'No changes were made.',
            }));
        }

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `Locked ${amount}/${savedChannels.length} lockdown channels.`,
        }));
    }

    /**
     * The `end` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TextChannel[]} savedChannels The saved lockdown channels of the server
     * @param {string} reason The reason of the lockdown
     */
    async end({ message, interaction }, savedChannels, reason) {
        if (savedChannels.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
        }
        reason ??= 'Thanks for waiting.';

        const confirmed = await confirmButtons({ message, interaction }, 'end lockdown', null, { reason });
        if (!confirmed) return;

        const { guild, guildId } = message || interaction;
        const { everyone } = guild.roles;

        const unlocking = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Unlocking all lockdown channels, please wait...',
        });
        const toDelete = await message?.replyEmbed(unlocking);
        await replyAll({ interaction }, unlocking);

        let amount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (!perms?.deny.has('SEND_MESSAGES')) continue;

            await permsManager.edit(everyone, { SEND_MESSAGES: null }, { reason, type: 0 });
            await channel.send({
                embeds: [basicEmbed({
                    emoji: '\\🔓', fieldName: 'This channel has been unlocked', fieldValue: reason,
                })],
            });
            amount++;
        }

        await toDelete?.delete().catch(() => null);
        await message?.channel.sendTyping().catch(() => null);

        if (amount === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'GOLD', description: 'No changes were made.',
            }));
        }

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `Unlocked ${amount}/${savedChannels.length} lockdown channels.`,
        }));
    }

    /**
     * The `channels` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TextChannel[]} channelsData The channels data for the server
     */
    async channels({ message, interaction }, channelsData) {
        if (channelsData.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
        }

        await generateEmbed({ message, interaction }, channelsData, {
            number: 20,
            authorName: `There's ${pluralize('lockdown channel', channelsData.length)}`,
            authorIconURL: (message || interaction).guild.iconURL({ dynamic: true }),
            useDescription: true,
        });
    }

    /**
     * The `add` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {SetupSchema} data The setup data
     * @param {string[]} savedChannels The ids of the saved channels of the server
     * @param {TextChannel[]} channels The lockdown channels to add
     */
    async add({ message, interaction }, data, savedChannels, channels) {
        if (message && !channels) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
            if (cancelled) return;
            channels = value;
        }

        const channelsList = channels.filter(c => !savedChannels.includes(c.id));
        if (channelsList.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'The channels you specified have already been added.',
            }));
        }

        const { guildId } = message || interaction;
        if (!data) {
            await this.db.add({
                guild: guildId,
                lockChannels: channelsList.map(c => c.id),
            });
        } else {
            await this.db.update(data, {
                $push: { lockChannels: { $each: channelsList.map(c => c.id) } },
            });
        }

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'The following lockdown channels have been added:',
            fieldValue: channelsList.join(', '),
        }));
    }

    /**
     * The `remove` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {SetupSchema} data The setup data
     * @param {string[]} savedChannels The ids of the saved channels of the server
     * @param {TextChannel[]} channels The lockdown channels to remove
     */
    async remove({ message, interaction }, data, savedChannels, channels) {
        if (savedChannels.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
        }

        if (message && !channels) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
            if (cancelled) return;
            channels = value;
        }

        const channelsList = channels.filter(c => savedChannels.includes(c.id));
        if (channelsList.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'The channels you specified have not been added.',
            }));
        }

        await this.db.update(data, {
            $pull: { lockChannels: { $in: channelsList.map(c => c.id) } },
        });

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'The following lockdown channels have been removed:',
            fieldValue: channelsList.join(', '),
        }));
    }
};
