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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2Rvd24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWFuYWdpbmcvbG9ja2Rvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQTBEO0FBQzFELHFEQVd5QjtBQUN6Qix1Q0FXcUI7QUFFckIsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO1FBQ2hELEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsVUFBVTtRQUNmLE1BQU0sRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztLQUdkO1FBQ0QsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsSUFBSSxzQkFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ25FLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ3BFLElBQUEsd0JBQWdCLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQzdELENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDM0QsQ0FBQztRQUNELFFBQVEsRUFBRSxLQUFLO1FBQ2YsS0FBSyxFQUFFLGtFQUFrRTtLQUM1RSxDQUFVLENBQUM7QUFRWixNQUFxQixlQUFnQixTQUFRLHlCQUFzQjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLDJFQUEyRTtZQUN4RixtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUcvQjtZQUNELE1BQU0sRUFBRSxJQUFBLHlCQUFXLEVBQUE7Ozs7OzthQU1sQjtZQUNELFFBQVEsRUFBRTtnQkFDTixnREFBZ0Q7Z0JBQ2hELDhDQUE4QzthQUNqRDtZQUNELGlCQUFpQixFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDckMsZUFBZSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQ2xDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLEVBQUU7WUFDQyxPQUFPLEVBQUUsQ0FBQztvQkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTtvQkFDN0MsSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLG9CQUFvQjtvQkFDakMsT0FBTyxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE1BQU07NEJBQ3pDLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxvQ0FBb0M7NEJBQ2pELFNBQVMsRUFBRSxHQUFHO3lCQUNqQixDQUFDO2lCQUNMLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLHlDQUE0QixDQUFDLFVBQVU7b0JBQzdDLElBQUksRUFBRSxLQUFLO29CQUNYLFdBQVcsRUFBRSxrQkFBa0I7b0JBQy9CLE9BQU8sRUFBRSxDQUFDOzRCQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxNQUFNOzRCQUN6QyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsa0NBQWtDOzRCQUMvQyxTQUFTLEVBQUUsR0FBRzt5QkFDakIsQ0FBQztpQkFDTCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxlQUFlO29CQUNsRCxJQUFJLEVBQUUsVUFBVTtvQkFDaEIsV0FBVyxFQUFFLHdDQUF3QztvQkFDckQsT0FBTyxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLFVBQVU7NEJBQzdDLElBQUksRUFBRSxLQUFLOzRCQUNYLFdBQVcsRUFBRSwwQ0FBMEM7NEJBQ3ZELE9BQU8sRUFBRSxDQUFDO29DQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxNQUFNO29DQUN6QyxJQUFJLEVBQUUsVUFBVTtvQ0FDaEIsV0FBVyxFQUFFLDJDQUEyQztvQ0FDeEQsUUFBUSxFQUFFLElBQUk7aUNBQ2pCLENBQUM7eUJBQ0wsRUFBRTs0QkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTs0QkFDN0MsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLDZDQUE2Qzs0QkFDMUQsT0FBTyxFQUFFLENBQUM7b0NBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE1BQU07b0NBQ3pDLElBQUksRUFBRSxVQUFVO29DQUNoQixXQUFXLEVBQUUsOENBQThDO29DQUMzRCxRQUFRLEVBQUUsSUFBSTtpQ0FDakIsQ0FBQzt5QkFDTCxFQUFFOzRCQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVOzRCQUM3QyxJQUFJLEVBQUUsTUFBTTs0QkFDWixXQUFXLEVBQUUsZ0NBQWdDO3lCQUNoRCxDQUFDO2lCQUNMLENBQUM7U0FDTCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FDWixPQUE2QixFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQWM7UUFFN0YsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLHlCQUFpQixFQUFDLE9BQU8sQ0FBb0IsQ0FBQztRQUNwRSxNQUFNLFlBQVksR0FBRyxzQkFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxDQUFDLE1BQU0scUJBQXFCLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztZQUM5RCxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRVQsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUNoQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBRW5DLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLE1BQU0sYUFBYSxHQUFHLHNCQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQ3pGLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBd0MsQ0FDakYsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRVYsUUFBUSxVQUFVLEVBQUU7WUFDaEIsS0FBSyxPQUFPO2dCQUNSLE9BQU8sTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLElBQUksTUFBTSxJQUFJLHlCQUF5QixDQUFDLENBQUM7WUFDaEgsS0FBSyxLQUFLO2dCQUNOLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLElBQUksTUFBTSxJQUFJLHFCQUFxQixDQUFDLENBQUM7WUFDMUcsS0FBSyxNQUFNO2dCQUNQLE9BQU8sTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM5RCxLQUFLLEtBQUs7Z0JBQ04sT0FBTyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQzVCLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUMzRSxDQUFDO1lBQ04sS0FBSyxRQUFRO2dCQUNULE9BQU8sTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQy9CLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUMzRSxDQUFDO1NBQ1Q7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsUUFBUSxDQUNwQixPQUE2QixFQUFFLGFBQW9DLEVBQUUsTUFBYztRQUVuRixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzVCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLCtFQUErRTthQUMvRixDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxzQkFBYyxFQUFDLE9BQU8sRUFBRTtZQUM1QyxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLE1BQU07U0FDVCxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbkMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFFakMsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO1lBQ2hELEtBQUssRUFBRSxNQUFNO1lBQ2IsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLCtDQUErQztTQUMvRCxDQUFDLENBQUMsQ0FBQztRQUVKLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN0QixLQUFLLE1BQU0sT0FBTyxJQUFJLGFBQWEsRUFBRTtZQUNqQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUM7WUFDbEQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7Z0JBQUUsU0FBUztZQUU5QyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDZixNQUFNLEVBQUUsQ0FBQyxJQUFBLGtCQUFVLEVBQUM7d0JBQ2hCLEtBQUssRUFBRSxNQUFNO3dCQUNiLFNBQVMsRUFBRSw4QkFBOEI7d0JBQ3pDLFVBQVUsRUFBRSxNQUFNO3FCQUNyQixDQUFDLENBQUM7YUFDTixDQUFDLENBQUM7WUFDSCxhQUFhLEVBQUUsQ0FBQztTQUNuQjtRQUVELElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtZQUNyQixNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRTtnQkFDakIsTUFBTSxFQUFFLENBQUMsSUFBQSxrQkFBVSxFQUFDO3dCQUNoQixLQUFLLEVBQUUsTUFBTTt3QkFDYixXQUFXLEVBQUUsdUJBQXVCO3FCQUN2QyxDQUFDLENBQUM7Z0JBQ0gsV0FBVzthQUNkLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFO1lBQ2pCLE1BQU0sRUFBRSxDQUFDLElBQUEsa0JBQVUsRUFBQztvQkFDaEIsS0FBSyxFQUFFLE9BQU87b0JBQ2QsS0FBSyxFQUFFLE9BQU87b0JBQ2QsV0FBVyxFQUFFLFVBQVUsYUFBYSxJQUFJLGFBQWEsQ0FBQyxNQUFNLHFCQUFxQjtpQkFDcEYsQ0FBQyxDQUFDO1lBQ0gsV0FBVztTQUNkLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNPLEtBQUssQ0FBQyxNQUFNLENBQ2xCLE9BQTZCLEVBQUUsYUFBb0MsRUFBRSxNQUFjO1FBRW5GLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsK0VBQStFO2FBQy9GLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsT0FBTyxFQUFFO1lBQzVDLE1BQU0sRUFBRSxjQUFjO1lBQ3RCLE1BQU07U0FDVCxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbkMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDakMsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO1lBQ2hELEtBQUssRUFBRSxNQUFNO1lBQ2IsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLGlEQUFpRDtTQUNqRSxDQUFDLENBQUMsQ0FBQztRQUVKLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN0QixLQUFLLE1BQU0sT0FBTyxJQUFJLGFBQWEsRUFBRTtZQUNqQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUM7WUFDbEQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztnQkFBRSxTQUFTO1lBRS9DLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0UsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNmLE1BQU0sRUFBRSxDQUFDLElBQUEsa0JBQVUsRUFBQzt3QkFDaEIsS0FBSyxFQUFFLE1BQU07d0JBQ2IsU0FBUyxFQUFFLGdDQUFnQzt3QkFDM0MsVUFBVSxFQUFFLE1BQU07cUJBQ3JCLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQztZQUNILGFBQWEsRUFBRSxDQUFDO1NBQ25CO1FBRUQsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFO2dCQUNqQixNQUFNLEVBQUUsQ0FBQyxJQUFBLGtCQUFVLEVBQUM7d0JBQ2hCLEtBQUssRUFBRSxNQUFNO3dCQUNiLFdBQVcsRUFBRSx1QkFBdUI7cUJBQ3ZDLENBQUMsQ0FBQztnQkFDSCxXQUFXO2FBQ2QsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUU7WUFDakIsTUFBTSxFQUFFLENBQUMsSUFBQSxrQkFBVSxFQUFDO29CQUNoQixLQUFLLEVBQUUsT0FBTztvQkFDZCxLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUsWUFBWSxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0scUJBQXFCO2lCQUN0RixDQUFDLENBQUM7WUFDSCxXQUFXO1NBQ2QsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ08sS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUE2QixFQUFFLFFBQStCO1FBQzFGLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdkIsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsK0VBQStFO2FBQy9GLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRTtZQUNuQyxNQUFNLEVBQUUsRUFBRTtZQUNWLFVBQVUsRUFBRSxXQUFXLElBQUEsaUJBQVMsRUFBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDdkUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzVELGNBQWMsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNPLEtBQUssQ0FBQyxjQUFjLENBQzFCLE9BQTZCLEVBQzdCLElBQXVDLEVBQ3ZDLGFBQXVCLEVBQ3ZCLFFBQWtCO1FBRWxCLE1BQU0sWUFBWSxHQUFHLElBQUEsc0JBQWMsRUFBQyxDQUFDLEdBQUcsYUFBYSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLHFEQUFxRDthQUNyRSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ25DLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUM7Z0JBQ1QsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsWUFBWSxFQUFFLFlBQVk7YUFDN0IsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztTQUN6RDtRQUVELE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUM1QixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsU0FBUyxFQUFFLGtEQUFrRDtZQUM3RCxVQUFVLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdEMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsaUJBQWlCLENBQzdCLE9BQTZCLEVBQzdCLElBQXVDLEVBQ3ZDLGFBQXVCLEVBQ3ZCLFFBQWtCO1FBRWxCLElBQUksQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckMsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsK0VBQStFO2FBQy9GLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLGlEQUFpRDthQUNqRSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDNUMsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxFQUFFO1NBQ2pELENBQUMsQ0FBQztRQUVILE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUM1QixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsU0FBUyxFQUFFLG9EQUFvRDtZQUMvRCxVQUFVLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdEMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0NBQ0o7QUEzVkQsa0NBMlZDO0FBRUQsS0FBSyxVQUFVLHFCQUFxQixDQUNoQyxLQUF1QixFQUFFLE9BQXdCLEVBQUUsT0FBd0I7SUFFM0UsSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLEVBQUUsQ0FBQztJQUN0QixNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDNUQsSUFBQSxxQkFBYSxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFhLEVBQUUsY0FBYyxDQUFDLENBQzVGLENBQUMsQ0FBQztJQUNILE9BQU8sc0JBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QyxDQUFDIn0=