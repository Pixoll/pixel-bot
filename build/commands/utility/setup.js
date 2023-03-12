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
        oneOf: [
            'view',
            'full',
            'reload',
            'audit-logs',
            'muted-role',
            'member-role',
            'bot-role',
            'lockdown-channels',
        ],
        default: 'full',
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'value',
        prompt: 'Please specify the value to set for that sub-command.',
        type: ['text-channel', 'role', 'string'],
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            return pixoll_commando_1.Util.equals(subCommand, ['full', 'reload', 'view']);
        },
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            if (pixoll_commando_1.Util.equals(subCommand, ['full', 'reload', 'view']))
                return true;
            if (subCommand === 'audit-logs') {
                return await (0, utils_1.validateArgInput)(value, message, argument, 'text-channel');
            }
            if (pixoll_commando_1.Util.equals(subCommand, ['bot-role', 'member-role', 'muted-role'])) {
                return await (0, utils_1.validateArgInput)(value, message, argument, 'role');
            }
            const results = await Promise.all((value ?? '').split(/ +/).map(query => (0, utils_1.validateArgInput)(query, message, argument, 'text-channel')));
            return results.find(result => result !== true) ?? true;
        },
        async parse(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            if (pixoll_commando_1.Util.equals(subCommand, ['full', 'reload', 'view']))
                return null;
            if (subCommand === 'lockdown-channels')
                return value;
            const argType = subCommand === 'audit-logs' ? 'text-channel' : 'role';
            return await (0, utils_1.parseArgInput)(value, message, argument, argType);
        },
    }];
class SetupCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'setup',
            group: 'utility',
            description: 'Setup the bot to its core. Data collected will be deleted if the bot leaves the server.',
            details: (0, common_tags_1.stripIndent) `
                \`text-channel\` can be either a text channel's name, mention or ID.
                \`role\` can be either a role's name, mention or ID.
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
            `,
            format: (0, common_tags_1.stripIndent) `
                setup <full> - Setup the bot completely to its core.
                setup view - View the current setup data of the server.
                setup reload - Reloads the data of the server.
                setup audit-logs [text-channel] - Setup the audit logs channel.
                setup muted-role [role] - Setup the role for muted members.
                setup member-role [role] - Setup the role given to a member upon joining.
                setup bot-role [role] - Setup the role given to a bot upon joining.
                setup lockdown-channels [text-channels] - Setup all the lockdown channels used in the \`lockdown\` command.
            `,
            userPermissions: ['Administrator'],
            guildOnly: true,
            guarded: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'View the current setup data of the server.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'full',
                    description: 'Setup the bot completely to its core.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Channel,
                            channelTypes: [discord_js_1.ChannelType.GuildText],
                            name: 'audit-logs-channel',
                            description: 'The channel where to send the audit logs.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            name: 'muted-role',
                            description: 'The role that will be given to muted members.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            name: 'member-role',
                            description: 'The role that will be given to a member upon joining.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            name: 'bot-role',
                            description: 'The role that will be given to a bot upon joining.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'lockdown-channels',
                            description: 'The channels for the lockdown command, separated by spaces (max. 30 at once).',
                            required: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'reload',
                    description: 'Reloads the data of the server.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'audit-logs',
                    description: 'Setup the audit logs channel.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Channel,
                            channelTypes: [discord_js_1.ChannelType.GuildText],
                            name: 'channel',
                            description: 'The channel where to send the audit logs.',
                            required: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'muted-role',
                    description: 'Setup the role for muted members.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            name: 'role',
                            description: 'The role that will be given to muted members.',
                            required: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'member-role',
                    description: 'Setup the role given to a member upon joining.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            name: 'role',
                            description: 'The role that will be given to a member upon joining.',
                            required: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'bot-role',
                    description: 'Setup the role given to a bot upon joining.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            name: 'role',
                            description: 'The role that will be given to a bot upon joining.',
                            required: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'lockdown-channels',
                    description: 'Setup all the lockdown channels used in the "lockdown" command.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'channels',
                            description: 'The channels for the lockdown command, separated by spaces (max. 30 at once).',
                            required: true,
                        }],
                }],
        });
    }
    async run(context, { subCommand, value, auditLogsChannel, mutedRole, memberRole, botRole, lockdownChannels, channel, role, channels, }) {
        const { guild } = context;
        const db = guild.database.setup;
        const data = await db.fetch();
        const setupData = {
            auditLogsChannel,
            mutedRole,
            memberRole,
            botRole,
            lockdownChannels,
        };
        switch (subCommand) {
            case 'full':
                return await this.runFull(context, data, context.isInteraction() ? setupData : null);
            case 'view':
                return await this.runView(context, data);
            case 'reload':
                return await this.runReload(context, data);
            case 'audit-logs':
                return await this.runAuditLogs(context, data, (value ?? channel));
            case 'muted-role':
                return await this.runMutedRole(context, data, (value ?? role));
            case 'member-role':
                return await this.runMemberRole(context, data, (value ?? role));
            case 'bot-role':
                return await this.runBotRole(context, data, (value ?? role));
            case 'lockdown-channels':
                return await this.lockdownChannels(context, data, (value ?? channels));
        }
    }
    /**
     * The `full` sub-command
     */
    async runFull(context, data, fullData) {
        const { guild, guildId } = context;
        const db = guild.database.setup;
        let logsChannel = fullData?.auditLogsChannel ?? null;
        let mutedRole = fullData?.mutedRole ?? null;
        let memberRole = fullData?.memberRole ?? null;
        let botRole = fullData?.botRole ?? null;
        const lockChannels = [];
        if (context.isMessage()) {
            logsChannel = await getInputFromCollector(context, this, 'text-channel', null, {
                fieldName: 'In what __text channel__ should I send the audit-logs?',
            });
            memberRole = await getInputFromCollector(context, this, 'role', utils_1.isModerator, {
                description: (0, utils_1.isModerator)(memberRole)
                    ? 'This is considered as a moderation role, please try again with another one.'
                    : `Audit logs will be sent in ${logsChannel}.`,
                fieldName: 'What __role__ should I give to a __member__ when they join the server?',
            });
            botRole = await getInputFromCollector(context, this, 'role', null, {
                description: `The default member role will be ${memberRole}.`,
                fieldName: 'What __role__ should I give to a __bot__ when they join the server?',
            });
            mutedRole = await getInputFromCollector(context, this, 'role', null, {
                description: `The default bot role will be ${botRole}.`,
                fieldName: 'What __role__ should I give to a __member__ when they get muted?',
            });
            let toDelete;
            while (lockChannels.length === 0) {
                const msg = await (0, utils_1.basicCollector)(context, {
                    description: `The role given to muted people will be ${mutedRole}.`,
                    fieldName: 'What __text channels__ should I lock when you use the `lockdown` command?',
                }, { time: 2 * 60000 }, true);
                if (!msg)
                    return;
                toDelete = msg;
                lockChannels.push(...await parseLockdownChannels(msg.content, context, this));
                lockChannels.splice(30, lockChannels.length - 30);
            }
            await toDelete?.delete();
        }
        else if (fullData) {
            const message = await context.fetchReply();
            if (!(0, utils_1.isValidRole)(message, mutedRole)) {
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen muted role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!(0, utils_1.isValidRole)(message, memberRole)) {
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default member role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!(0, utils_1.isValidRole)(message, botRole)) {
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default bot role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            lockChannels.push(...await parseLockdownChannels(fullData.lockdownChannels, message, this));
            lockChannels.splice(30, lockChannels.length - 30);
            if (lockChannels.length === 0) {
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'None of the lockdown channels you specified were valid. Please try again.',
                }));
                return;
            }
        }
        const msg = await (0, utils_1.basicCollector)(context, {
            description: (0, common_tags_1.stripIndent) `
            **This is all the data I got:**
            Audit logs channel: ${logsChannel}
            Default members role: ${memberRole}
            Default bots role: ${botRole}
            Muted members role: ${mutedRole}
            Lockdown channels: ${lockChannels.map(c => c.toString()).join(', ')}
            `,
            fieldName: 'Is this data correct? If so, type `confirm` to proceed.',
        }, null, true);
        if (!msg)
            return;
        if (msg.content.toLowerCase() !== 'confirm') {
            await (0, utils_1.replyAll)(context, {
                content: 'Cancelled command.',
                embeds: [],
            });
            return;
        }
        const doc = {
            guild: guildId,
            logsChannel: logsChannel?.id,
            memberRole: memberRole?.id,
            botRole: botRole?.id,
            mutedRole: mutedRole?.id,
            lockChannels: lockChannels.map(c => c.id),
        };
        if (data)
            await db.update(data, doc);
        else
            await db.add(doc);
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'The data for this server has been saved. Use the `view` sub-command if you wish to check it out.',
        }));
    }
    /**
     * The `view` sub-command
     */
    async runView(context, data) {
        const hasNoData = !data
            || pixoll_commando_1.Util.filterNullishItems(Object.values(pixoll_commando_1.Util.omit(data, ['_id', 'guild']))).length === 0;
        if (hasNoData) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.',
            }));
            return;
        }
        const { guild } = context;
        const logsChannel = data.logsChannel ? `<#${data.logsChannel}>` : 'None';
        const memberRole = data.memberRole ? `<@&${data.memberRole}> (${data.memberRole})` : 'None';
        const botRole = data.botRole ? `<@&${data.botRole}> (${data.botRole})` : 'None';
        const mutedRole = data.mutedRole ? `<@&${data.mutedRole}> (${data.mutedRole})` : 'None';
        const lockdownChannels = data.lockChannels?.map(id => `<#${id}>`).join(' ') || 'None';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${guild.name}'s setup data`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .addFields({
            name: 'Audit logs channel',
            value: logsChannel,
        }, {
            name: 'Default members role',
            value: memberRole,
        }, {
            name: 'Default bots role',
            value: botRole,
        }, {
            name: 'Muted members role',
            value: mutedRole,
        }, {
            name: 'Lockdown channels',
            value: lockdownChannels,
        })
            .setFooter({
            text: 'Missing or wrong data? Try using the "reload" sub-command.',
        });
        await (0, utils_1.replyAll)(context, embed);
    }
    /**
     * The `reload` sub-command
     */
    async runReload(context, data) {
        if (!data) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.',
            }));
            return;
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Reloading setup data...',
        }));
        const { guild } = context;
        const db = guild.database.setup;
        const updateQuery = {
            $set: {},
            $unset: {},
        };
        if (updateQuery.$unset && data.logsChannel) {
            const logsChannel = await guild.channels.fetch(data.logsChannel).catch(() => null);
            if (!logsChannel)
                updateQuery.$unset.logsChannel = '';
        }
        if (updateQuery.$unset && data.memberRole) {
            const memberRole = await guild.roles.fetch(data.memberRole).catch(() => null);
            if (!memberRole)
                updateQuery.$unset.memberRole = '';
        }
        if (updateQuery.$unset && data.botRole) {
            const botRole = await guild.roles.fetch(data.botRole).catch(() => null);
            if (!botRole)
                updateQuery.$unset.botRole = '';
        }
        if (updateQuery.$unset && data.mutedRole) {
            const mutedRole = await guild.roles.fetch(data.mutedRole).catch(() => null);
            if (!mutedRole)
                updateQuery.$unset.mutedRole = '';
        }
        if (updateQuery.$set && data.lockChannels && data.lockChannels.length !== 0) {
            const lockChannels = pixoll_commando_1.Util.filterNullishItems(await Promise.all(data.lockChannels.map(id => guild.channels.fetch(id).catch(() => null).then(channel => channel?.id))));
            if (data.lockChannels.length !== lockChannels.length) {
                updateQuery.$set.lockChannels = lockChannels;
            }
        }
        if (Object.keys(updateQuery.$set ?? {}).length === 0)
            delete updateQuery.$set;
        if (Object.keys(updateQuery.$unset ?? {}).length === 0)
            delete updateQuery.$unset;
        if (Object.keys(updateQuery).length !== 0) {
            await db.update(data, updateQuery);
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'Reloaded data.',
        }));
    }
    /**
     * The `audit-logs` sub-command
     */
    async runAuditLogs(context, data, channel) {
        const { guildId, guild } = context;
        const db = guild.database.setup;
        if (data)
            await db.update(data, { logsChannel: channel.id });
        else
            await db.add(defaultDocument(guildId, 'logsChannel', channel.id));
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: (0, common_tags_1.oneLine) `
            The new audit logs channel will be ${channel.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }
    /**
     * The `muted-role` sub-command
     */
    async runMutedRole(context, data, role) {
        const { guild, guildId } = context;
        const db = guild.database.setup;
        if (data)
            await db.update(data, { mutedRole: role.id });
        else
            await db.add(defaultDocument(guildId, 'mutedRole', role.id));
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: (0, common_tags_1.oneLine) `
            The new role for muted members will be ${role.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }
    /**
     * The `member-role` sub-command
     */
    async runMemberRole(context, data, role) {
        const { guild, guildId } = context;
        const db = guild.database.setup;
        if (data)
            await db.update(data, { memberRole: role.id });
        else
            await db.add(defaultDocument(guildId, 'memberRole', role.id));
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: (0, common_tags_1.oneLine) `
            The new default role for all members will be ${role.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }
    /**
     * The `bot-role` sub-command
     */
    async runBotRole(context, data, role) {
        const { guild, guildId } = context;
        const db = guild.database.setup;
        if (data)
            await db.update(data, { botRole: role.id });
        else
            await db.add(defaultDocument(guildId, 'botRole', role.id));
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: (0, common_tags_1.oneLine) `
            The new default role for all bots will be ${role.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }
    /**
     * The `lockdown-channels` sub-command
     */
    async lockdownChannels(context, data, channelsString) {
        const { guild, guildId } = context;
        const db = guild.database.setup;
        const message = context.isMessage() ? context : await context.fetchReply();
        const channels = await parseLockdownChannels(channelsString, message, this);
        const lockChannels = (0, utils_1.removeRepeated)(channels.map(c => c.id)).slice(0, 30);
        if (data)
            await db.update(data, { lockChannels });
        else
            await db.add(defaultDocument(guildId, 'lockChannels', lockChannels));
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: (0, common_tags_1.oneLine) `
            I have saved all the lockdown channels you specified.
            Use the \`view\` sub-command if you wish to check it out.
            `,
            fieldName: 'Channels list:',
            fieldValue: lockChannels.map(id => `<#${id}>`).join(' '),
        }));
    }
}
exports.default = SetupCommand;
function defaultDocument(guildId, key, value) {
    const doc = {
        guild: guildId,
    };
    doc[key] = value;
    return doc;
}
async function parseCollectorInput(value, message, command, type) {
    const argument = command.argsCollector?.args[1];
    return await (0, utils_1.parseArgInput)(value, message, argument, type);
}
async function parseLockdownChannels(value, message, command) {
    const results = await Promise.all(value.split(/ +/).map(query => (0, utils_1.parseArgInput)(query, message, command.argsCollector?.args[1], 'text-channel')));
    return pixoll_commando_1.Util.filterNullishItems(results);
}
async function getInputFromCollector(message, command, type, validator, embedOptions, time) {
    let value;
    let promptMessage;
    while (!value || validator?.(value)) {
        const reply = await (0, utils_1.basicCollector)(message, embedOptions, { time }, true);
        if (!reply)
            return null;
        promptMessage = reply;
        value = await parseCollectorInput(reply.content, message, command, type);
    }
    await promptMessage?.delete();
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9zZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCwyQ0FBOEY7QUFFOUYscURBZ0J5QjtBQUN6Qix1Q0FXcUI7QUFFckIsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUU7WUFDSCxNQUFNO1lBQ04sTUFBTTtZQUNOLFFBQVE7WUFDUixZQUFZO1lBQ1osWUFBWTtZQUNaLGFBQWE7WUFDYixVQUFVO1lBQ1YsbUJBQW1CO1NBQ3RCO1FBQ0QsT0FBTyxFQUFFLE1BQU07UUFDZixLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLE9BQU87UUFDWixNQUFNLEVBQUUsdURBQXVEO1FBQy9ELElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxPQUFPLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFB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