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
            detailedDescription: (0, common_tags_1.stripIndent) `
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
        const message = await (0, utils_1.getContextMessage)(context);
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        const replyToEdit = await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Locking all lockdown channels, please wait...',
        }));
        let changesAmount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (perms?.deny.has('SendMessages'))
                continue;
            await permsManager.edit(everyone.id, { SendMessages: false }, { reason, type: 0 });
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
            await (0, utils_1.reply)(context, {
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        description: 'No changes were made.',
                    })],
                replyToEdit,
            });
            return;
        }
        await (0, utils_1.reply)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    description: `Locked ${changesAmount}/${savedChannels.length} lockdown channels.`,
                })],
            replyToEdit,
        });
    }
    /**
     * The `end` sub-command
     */
    async runEnd(context, savedChannels, reason) {
        if (savedChannels.length === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        const replyToEdit = await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Unlocking all lockdown channels, please wait...',
        }));
        let changesAmount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (!perms?.deny.has('SendMessages'))
                continue;
            await permsManager.edit(everyone.id, { SendMessages: null }, { reason, type: 0 });
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
            await (0, utils_1.reply)(context, {
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        description: 'No changes were made.',
                    })],
                replyToEdit,
            });
            return;
        }
        await (0, utils_1.reply)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    description: `Unlocked ${changesAmount}/${savedChannels.length} lockdown channels.`,
                })],
            replyToEdit,
        });
    }
    /**
     * The `channels` sub-command
     */
    async runChannelsView(context, channels) {
        if (channels.length === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }
        const channelsList = channels.filter(id => savedChannels.includes(id));
        if (channelsList.length === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The channels you specified have not been added.',
            }));
            return;
        }
        await context.guild.database.setup.update(data, {
            $pull: { lockChannels: { $in: channelsList } },
        });
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2Rvd24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWFuYWdpbmcvbG9ja2Rvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXVFO0FBQ3ZFLHFEQVd5QjtBQUN6Qix1Q0FXcUI7QUFFckIsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO1FBQ2hELEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsVUFBVTtRQUNmLE1BQU0sRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztLQUdkO1FBQ0QsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsSUFBSSxzQkFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ25FLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ3BFLElBQUEsd0JBQWdCLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFR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