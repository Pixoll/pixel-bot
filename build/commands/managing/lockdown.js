"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['start', 'end', 'view', 'add', 'remove'],
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'channels',
        prompt: (0, common_tags_1.oneLine) `
        Why are you starting/ending the lockdown? Or
        what channels do you want to add or remove? (max. 30 at once)
    `,
        type: 'string',
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            if (pixoll_commando_1.Util.equals(subCommand, ['end', 'start', 'view']))
                return true;
            const results = await Promise.all((value ?? '').split(/ +/).map(query => (0, utils_1.validateArgInput)(query, message, argument, 'text-channel')));
            return results.find(result => result !== true) ?? true;
        },
        required: false,
        error: 'None of the channels you specified were valid. Please try again.',
    }];
class LockdownCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'lockdown',
            group: 'managing',
            description: 'Lock every text channel that was specified when using the `setup` command',
            details: (0, common_tags_1.stripIndent) `
                If \`reason\` is not specified, it will default as "We'll be back shortly" or "Thanks for waiting".
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
            `,
            format: (0, common_tags_1.stripIndent) `
                lockdown start <reason> - Start the lockdown.
                lockdown end <reason> - End the lockdown.
                lockdown view - Display the lockdown channels.
                lockdown add [text-channels] - Add lockdown channels (max. 30 at once).
                lockdown remove [text-channels] - Remove lockdown channels (max. 30 at once).
            `,
            examples: [
                'lockdown add #chat commands 850477653252243466',
                'lockdown remove #commands 800224125444292608',
            ],
            clientPermissions: ['ManageChannels'],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'start',
                    description: 'Start the lockdown',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'reason',
                            description: 'Why are you starting the lockdown.',
                            maxLength: 512,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'end',
                    description: 'End the lockdown',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'reason',
                            description: 'Why are you ending the lockdown.',
                            maxLength: 512,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
                    name: 'channels',
                    description: 'View, add or remove lockdown channels.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                            name: 'add',
                            description: 'Add lockdown channels (max. 30 at once).',
                            options: [{
                                    type: discord_js_1.ApplicationCommandOptionType.String,
                                    name: 'channels',
                                    description: 'The channels to add, separated by spaces.',
                                    required: true,
                                }],
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                            name: 'remove',
                            description: 'Remove lockdown channels (max. 30 at once).',
                            options: [{
                                    type: discord_js_1.ApplicationCommandOptionType.String,
                                    name: 'channels',
                                    description: 'The channels to remove, separated by spaces.',
                                    required: true,
                                }],
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                            name: 'view',
                            description: 'Display the lockdown channels.',
                        }],
                }],
        });
    }
    async run(context, { subCommand, channels: channelsOrReason, reason }) {
        const message = context.isMessage() ? context : await context.fetchReply();
        const lockChannels = pixoll_commando_1.Util.equals(subCommand, ['start', 'end'])
            ? await parseLockdownChannels(channelsOrReason, message, this)
            : [];
        const { guild } = context;
        const db = guild.database.setup;
        const allChannels = guild.channels;
        const data = await db.fetch();
        const savedChannels = pixoll_commando_1.Util.filterNullishItems(await Promise.all(data?.lockChannels?.map(id => allChannels.fetch(id).catch(() => null)) ?? []));
        switch (subCommand) {
            case 'start':
                return await this.runStart(context, savedChannels, channelsOrReason ?? reason ?? 'We\'ll be back shortly.');
            case 'end':
                return await this.runEnd(context, savedChannels, channelsOrReason ?? reason ?? 'Thanks for waiting.');
            case 'view':
                return await this.runChannelsView(context, savedChannels);
            case 'add':
                return await this.runChannelsAdd(context, data, savedChannels.map(c => c.id), lockChannels.map(c => c.id));
            case 'remove':
                return await this.runChannelsRemove(context, data, savedChannels.map(c => c.id), lockChannels.map(c => c.id));
        }
    }
    /**
     * The `start` sub-command
     */
    async runStart(context, savedChannels, reason) {
        if (savedChannels.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'start lockdown',
            reason,
        });
        if (!confirmed)
            return;
        const { guild, guildId } = context;
        const { everyone } = guild.roles;
        await (0, utils_1.replyAll)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Gold',
                    emoji: 'loading',
                    description: 'Locking all lockdown channels, please wait...',
                })],
            editReply: true,
        });
        let changesAmount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (perms?.deny.has('SendMessages'))
                continue;
            await permsManager.edit(everyone, { SendMessages: false }, { reason, type: 0 });
            await channel.send({
                embeds: [(0, utils_1.basicEmbed)({
                        emoji: '\\🔒',
                        fieldName: 'This channel has been locked',
                        fieldValue: reason,
                    })],
            });
            changesAmount++;
        }
        if (changesAmount === 0) {
            await (0, utils_1.replyAll)(context, {
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        description: 'No changes were made.',
                    })],
                editReply: true,
            });
            return;
        }
        await (0, utils_1.replyAll)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    description: `Locked ${changesAmount}/${savedChannels.length} lockdown channels.`,
                })],
            editReply: true,
        });
    }
    /**
     * The `end` sub-command
     */
    async runEnd(context, savedChannels, reason) {
        if (savedChannels.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'end lockdown',
            reason,
        });
        if (!confirmed)
            return;
        const { guild, guildId } = context;
        const { everyone } = guild.roles;
        await (0, utils_1.replyAll)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Gold',
                    emoji: 'loading',
                    description: 'Unlocking all lockdown channels, please wait...',
                })],
            editReply: true,
        });
        let changesAmount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (!perms?.deny.has('SendMessages'))
                continue;
            await permsManager.edit(everyone, { SendMessages: null }, { reason, type: 0 });
            await channel.send({
                embeds: [(0, utils_1.basicEmbed)({
                        emoji: '\\🔓',
                        fieldName: 'This channel has been unlocked',
                        fieldValue: reason,
                    })],
            });
            changesAmount++;
        }
        if (changesAmount === 0) {
            await (0, utils_1.replyAll)(context, {
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        description: 'No changes were made.',
                    })],
                editReply: true,
            });
            return;
        }
        await (0, utils_1.replyAll)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    description: `Unlocked ${changesAmount}/${savedChannels.length} lockdown channels.`,
                })],
            editReply: true,
        });
    }
    /**
     * The `channels` sub-command
     */
    async runChannelsView(context, channels) {
        if (channels.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }
        await (0, utils_1.generateEmbed)(context, channels, {
            number: 20,
            authorName: `There's ${(0, utils_1.pluralize)('lockdown channel', channels.length)}`,
            authorIconURL: context.guild.iconURL({ forceStatic: false }),
            useDescription: true,
        });
    }
    /**
     * The `add` sub-command
     */
    async runChannelsAdd(context, data, savedChannels, channels) {
        const channelsList = (0, utils_1.removeRepeated)([...savedChannels, ...channels]);
        if (channelsList.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The channels you specified have already been added.',
            }));
            return;
        }
        const { guild, guildId } = context;
        const db = guild.database.setup;
        if (!data) {
            await db.add({
                guild: guildId,
                lockChannels: channelsList,
            });
        }
        else {
            await db.update(data, { lockChannels: channelsList });
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: 'The following lockdown channels have been added:',
            fieldValue: channelsList.join(', '),
        }));
    }
    /**
     * The `remove` sub-command
     */
    async runChannelsRemove(context, data, savedChannels, channels) {
        if (!data || savedChannels.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }
        const channelsList = channels.filter(id => savedChannels.includes(id));
        if (channelsList.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The channels you specified have not been added.',
            }));
            return;
        }
        await context.guild.database.setup.update(data, {
            $pull: { lockChannels: { $in: channelsList } },
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: 'The following lockdown channels have been removed:',
            fieldValue: channelsList.join(', '),
        }));
    }
}
exports.default = LockdownCommand;
async function parseLockdownChannels(value, message, command) {
    if (!value)
        return [];
    const results = await Promise.all(value.split(/ +/).map(query => (0, utils_1.parseArgInput)(query, message, command.argsCollector?.args[1], 'text-channel')));
    return pixoll_commando_1.Util.filterNullishItems(results);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2Rvd24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWFuYWdpbmcvbG9ja2Rvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQTBEO0FBQzFELHFEQVV5QjtBQUN6Qix1Q0FVcUI7QUFFckIsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO1FBQ2hELEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsVUFBVTtRQUNmLE1BQU0sRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztLQUdkO1FBQ0QsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsSUFBSSxzQkFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ25FLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ3BFLElBQUEsd0JBQWdCLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFR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