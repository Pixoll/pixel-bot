"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
    }, {
        key: 'value',
        prompt: 'Please specify the value to set for that sub-command.',
        type: ['text-channel', 'role', 'string'],
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            return pixoll_commando_1.Util.equals(subCommand, ['full', 'reload', 'view']);
        },
        async validate(value, message, argument) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            if (pixoll_commando_1.Util.equals(subCommand, ['full', 'reload', 'view']))
                return true;
            if (subCommand === 'audit-logs') {
                return await validateArgInput(value, message, argument, 'text-channel');
            }
            if (pixoll_commando_1.Util.equals(subCommand, ['bot-role', 'member-role', 'muted-role'])) {
                return await validateArgInput(value, message, argument, 'role');
            }
            const results = await Promise.all(value.split(/ +/).map(query => validateArgInput(query, message, argument, 'text-channel')));
            return results.find(result => result !== true) ?? true;
        },
        async parse(value, message, argument) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            if (pixoll_commando_1.Util.equals(subCommand, ['full', 'reload', 'view']))
                return null;
            if (subCommand === 'lockdown-channels')
                return value;
            const argType = subCommand === 'audit-logs' ? 'text-channel' : 'role';
            return await parseArgInput(value, message, argument, argType);
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
        const lcSubCommand = subCommand.toLowerCase();
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
        switch (lcSubCommand) {
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
            memberRole = await getInputFromCollector(context, this, 'role', functions_1.isModerator, {
                description: (0, functions_1.isModerator)(memberRole)
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
                const msg = await (0, functions_1.basicCollector)(context, {
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
            if (!(0, functions_1.isValidRole)(message, mutedRole)) {
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen muted role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!(0, functions_1.isValidRole)(message, memberRole)) {
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default member role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!(0, functions_1.isValidRole)(message, botRole)) {
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default bot role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            lockChannels.push(...await parseLockdownChannels(fullData.lockdownChannels, message, this));
            lockChannels.splice(30, lockChannels.length - 30);
            if (lockChannels.length === 0) {
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'None of the lockdown channels you specified were valid. Please try again.',
                }));
                return;
            }
        }
        const msg = await (0, functions_1.basicCollector)(context, {
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
            await (0, functions_1.replyAll)(context, {
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
            || pixoll_commando_1.Util.filterNullishItems(Object.values(pixoll_commando_1.Util.omit(data, ['__v', '_id', 'guild']))).length === 0;
        if (hasNoData) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, embed);
    }
    /**
     * The `reload` sub-command
     */
    async runReload(context, data) {
        if (!data) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.',
            }));
            return;
        }
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        const lockChannels = (0, functions_1.removeRepeated)(channels.map(c => c.id)).slice(0, 30);
        if (data)
            await db.update(data, { lockChannels });
        else
            await db.add(defaultDocument(guildId, 'lockChannels', lockChannels));
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
async function validateArgInput(value, message, argument, type) {
    const argumentType = type ? message.client.registry.types.get(type) : argument.type;
    return argumentType?.validate(value, message, argument) ?? true;
}
async function parseArgInput(value, message, argument, type) {
    const argumentType = type ? message.client.registry.types.get(type) : argument.type;
    const result = argumentType?.parse(value, message, argument) ?? null;
    return result;
}
async function parseCollectorInput(value, message, command, type) {
    const argument = command.argsCollector?.args[1];
    return await parseArgInput(value, message, argument, type);
}
async function parseLockdownChannels(value, message, command) {
    const results = await Promise.all(value.split(/ +/).map(query => parseArgInput(query, message, command.argsCollector?.args[1], 'text-channel')));
    return pixoll_commando_1.Util.filterNullishItems(results);
}
async function getInputFromCollector(message, command, type, validator, embedOptions, time) {
    let value;
    let promptMessage;
    while (!value || validator?.(value)) {
        const reply = await (0, functions_1.basicCollector)(message, embedOptions, { time }, true);
        if (!reply)
            return null;
        promptMessage = reply;
        value = await parseCollectorInput(reply.content, message, command, type);
    }
    await promptMessage?.delete();
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9zZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCwyQ0FBOEY7QUFFOUYscURBZXlCO0FBQ3pCLHFEQVMrQjtBQUUvQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRTtZQUNILE1BQU07WUFDTixNQUFNO1lBQ04sUUFBUTtZQUNSLFlBQVk7WUFDWixZQUFZO1lBQ1osYUFBYTtZQUNiLFVBQVU7WUFDVixtQkFBbUI7U0FDdEI7UUFDRCxPQUFPLEVBQUUsTUFBTTtLQUNsQixFQUFFO1FBQ0MsR0FBRyxFQUFFLE9BQU87UUFDWixNQUFNLEVBQUUsdURBQXVEO1FBQy9ELElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVMsRUFBRSxPQUF3QjtZQUN2QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHlCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxPQUFPLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFhLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUN0RSxNQUFNLFVBQVUsR0FBRyxJQUFBLHlCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxJQUFJLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDckUsSUFBSSxVQUFVLEtBQUssWUFBWSxFQUFFO2dCQUM3QixPQUFPLE1BQU0sZ0JBQWdCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDM0U7WUFDRCxJQUFJLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBRTtnQkFDcEUsT0FBTyxNQUFNLGdCQUFnQixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ25FO1lBQ0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQzVELGdCQUFnQixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUM3RCxDQUFDLENBQUM7WUFDSCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzNELENBQUM7UUFDRCxLQUFLLENBQUMsS0FBSyxDQUNQLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBRTNELE1BQU0sVUFBVSxHQUFHLElBQUEseUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLElBQUksc0JBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNyRSxJQUFJLFVBQVUsS0FBSyxtQkFBbUI7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDckQsTUFBTSxPQUFPLEdBQUcsVUFBVSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDdEUsT0FBTyxNQUFNLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRSxDQUFDO0tBQ0osQ0FBVSxDQUFDO0FBc0JaLE1BQXFCLFlBQWEsU0FBUSx5QkFBc0I7SUFDNUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLHlGQUF5RjtZQUN0RyxPQUFPLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7O2FBSW5CO1lBQ0QsTUFBTSxFQUFFLElBQUEseUJBQVcsRUFBQTs7Ozs7Ozs7O2FBU2xCO1lBQ0QsZUFBZSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQ2xDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJO1NBQ1AsRUFBRTtZQUNDLE9BQU8sRUFBRSxDQUFDO29CQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsTUFBTTtvQkFDWixXQUFXLEVBQUUsNENBQTRDO2lCQUM1RCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsTUFBTTtvQkFDWixXQUFXLEVBQUUsdUNBQXVDO29CQUNwRCxPQUFPLEVBQUUsQ0FBQzs0QkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsT0FBTzs0QkFDMUMsWUFBWSxFQUFFLENBQUMsd0JBQVcsQ0FBQyxTQUFTLENBQUM7NEJBQ3JDLElBQUksRUFBRSxvQkFBb0I7NEJBQzFCLFdBQVcsRUFBRSwyQ0FBMkM7NEJBQ3hELFFBQVEsRUFBRSxJQUFJO3lCQUNqQixFQUFFOzRCQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxJQUFJOzRCQUN2QyxJQUFJLEVBQUUsWUFBWTs0QkFDbEIsV0FBVyxFQUFFLCtDQUErQzs0QkFDNUQsUUFBUSxFQUFFLElBQUk7eUJBQ2pCLEVBQUU7NEJBQ0MsSUFBSSxFQUFFLHlDQUE0QixDQUFDLElBQUk7NEJBQ3ZDLElBQUksRUFBRSxhQUFhOzRCQUNuQixXQUFXLEVBQUUsdURBQXVEOzRCQUNwRSxRQUFRLEVBQUUsSUFBSTt5QkFDakIsRUFBRTs0QkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsSUFBSTs0QkFDdkMsSUFBSSxFQUFFLFVBQVU7NEJBQ2hCLFdBQVcsRUFBRSxvREFBb0Q7NEJBQ2pFLFFBQVEsRUFBRSxJQUFJO3lCQUNqQixFQUFFOzRCQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxNQUFNOzRCQUN6QyxJQUFJLEVBQUUsbUJBQW1COzRCQUN6QixXQUFXLEVBQUUsK0VBQStFOzRCQUM1RixRQUFRLEVBQUUsSUFBSTt5QkFDakIsQ0FBQztpQkFDTCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUsaUNBQWlDO2lCQUNqRCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsWUFBWTtvQkFDbEIsV0FBVyxFQUFFLCtCQUErQjtvQkFDNUMsT0FBTyxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE9BQU87NEJBQzFDLFlBQVksRUFBRSxDQUFDLHdCQUFXLENBQUMsU0FBUyxDQUFDOzRCQUNyQyxJQUFJLEVBQUUsU0FBUzs0QkFDZixXQUFXLEVBQUUsMkNBQTJDOzRCQUN4RCxRQUFRLEVBQUUsSUFBSTt5QkFDakIsQ0FBQztpQkFDTCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsWUFBWTtvQkFDbEIsV0FBVyxFQUFFLG1DQUFtQztvQkFDaEQsT0FBTyxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLElBQUk7NEJBQ3ZDLElBQUksRUFBRSxNQUFNOzRCQUNaLFdBQVcsRUFBRSwrQ0FBK0M7NEJBQzVELFFBQVEsRUFBRSxJQUFJO3lCQUNqQixDQUFDO2lCQUNMLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLHlDQUE0QixDQUFDLFVBQVU7b0JBQzdDLElBQUksRUFBRSxhQUFhO29CQUNuQixXQUFXLEVBQUUsZ0RBQWdEO29CQUM3RCxPQUFPLEVBQUUsQ0FBQzs0QkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsSUFBSTs0QkFDdkMsSUFBSSxFQUFFLE1BQU07NEJBQ1osV0FBVyxFQUFFLHVEQUF1RDs0QkFDcEUsUUFBUSxFQUFFLElBQUk7eUJBQ2pCLENBQUM7aUJBQ0wsRUFBRTtvQkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTtvQkFDN0MsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFdBQVcsRUFBRSw2Q0FBNkM7b0JBQzFELE9BQU8sRUFBRSxDQUFDOzRCQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxJQUFJOzRCQUN2QyxJQUFJLEVBQUUsTUFBTTs0QkFDWixXQUFXLEVBQUUsb0RBQW9EOzRCQUNqRSxRQUFRLEVBQUUsSUFBSTt5QkFDakIsQ0FBQztpQkFDTCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsbUJBQW1CO29CQUN6QixXQUFXLEVBQUUsaUVBQWlFO29CQUM5RSxPQUFPLEVBQUUsQ0FBQzs0QkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsTUFBTTs0QkFDekMsSUFBSSxFQUFFLFVBQVU7NEJBQ2hCLFdBQVcsRUFBRSwrRUFBK0U7NEJBQzVGLFFBQVEsRUFBRSxJQUFJO3lCQUNqQixDQUFDO2lCQUNMLENBQUM7U0FDTCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQzVDLFVBQVUsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEdBQ3JHO1FBQ1QsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFFaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsTUFBTSxTQUFTLEdBQUc7WUFDZCxnQkFBZ0I7WUFDaEIsU0FBUztZQUNULFVBQVU7WUFDVixPQUFPO1lBQ1AsZ0JBQWdCO1NBQ25CLENBQUM7UUFFRixRQUFRLFlBQVksRUFBRTtZQUNsQixLQUFLLE1BQU07Z0JBQ1AsT0FBTyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQTBCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFHLEtBQUssTUFBTTtnQkFDUCxPQUFPLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0MsS0FBSyxRQUFRO2dCQUNULE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQyxLQUFLLFlBQVk7Z0JBQ2IsT0FBTyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxPQUFPLENBQXdCLENBQUMsQ0FBQztZQUM3RixLQUFLLFlBQVk7Z0JBQ2IsT0FBTyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQWlCLENBQUMsQ0FBQztZQUNuRixLQUFLLGFBQWE7Z0JBQ2QsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQWlCLENBQUMsQ0FBQztZQUNwRixLQUFLLFVBQVU7Z0JBQ1gsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQWlCLENBQUMsQ0FBQztZQUNqRixLQUFLLG1CQUFtQjtnQkFDcEIsT0FBTyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBVyxDQUFDLENBQUM7U0FDeEY7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsT0FBTyxDQUNuQixPQUE2QixFQUFFLElBQXdCLEVBQUUsUUFBOEI7UUFFdkYsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbkMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFFaEMsSUFBSSxXQUFXLEdBQUcsUUFBUSxFQUFFLGdCQUFnQixJQUFJLElBQUksQ0FBQztRQUNyRCxJQUFJLFNBQVMsR0FBRyxRQUFRLEVBQUUsU0FBUyxJQUFJLElBQUksQ0FBQztRQUM1QyxJQUFJLFVBQVUsR0FBRyxRQUFRLEVBQUUsVUFBVSxJQUFJLElBQUksQ0FBQztRQUM5QyxJQUFJLE9BQU8sR0FBRyxRQUFRLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQztRQUN4QyxNQUFNLFlBQVksR0FBMEIsRUFBRSxDQUFDO1FBRS9DLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ3JCLFdBQVcsR0FBRyxNQUFNLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRTtnQkFDM0UsU0FBUyxFQUFFLHdEQUF3RDthQUN0RSxDQUFDLENBQUM7WUFDSCxVQUFVLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSx1QkFBVyxFQUFFO2dCQUN6RSxXQUFXLEVBQUUsSUFBQSx1QkFBVyxFQUFDLFVBQVUsQ0FBQztvQkFDaEMsQ0FBQyxDQUFDLDZFQUE2RTtvQkFDL0UsQ0FBQyxDQUFDLDhCQUE4QixXQUFXLEdBQUc7Z0JBQ2xELFNBQVMsRUFBRSx3RUFBd0U7YUFDdEYsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxHQUFHLE1BQU0scUJBQXFCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQUMvRCxXQUFXLEVBQUUsbUNBQW1DLFVBQVUsR0FBRztnQkFDN0QsU0FBUyxFQUFFLHFFQUFxRTthQUNuRixDQUFDLENBQUM7WUFDSCxTQUFTLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBQ2pFLFdBQVcsRUFBRSxnQ0FBZ0MsT0FBTyxHQUFHO2dCQUN2RCxTQUFTLEVBQUUsa0VBQWtFO2FBQ2hGLENBQUMsQ0FBQztZQUVILElBQUksUUFBNkIsQ0FBQztZQUNsQyxPQUFPLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM5QixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEsMEJBQWMsRUFBQyxPQUFPLEVBQUU7b0JBQ3RDLFdBQVcsRUFBRSwwQ0FBMEMsU0FBUyxHQUFHO29CQUNuRSxTQUFTLEVBQUUsMkVBQTJFO2lCQUN6RixFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLEdBQUc7b0JBQUUsT0FBTztnQkFDakIsUUFBUSxHQUFHLEdBQUcsQ0FBQztnQkFDZixZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QsTUFBTSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7U0FDNUI7YUFBTSxJQUFJLFFBQVEsRUFBRTtZQUNqQixNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQTJCLENBQUM7WUFFcEUsSUFBSSxDQUFDLElBQUEsdUJBQVcsRUFBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLHNCQUFVLEVBQUM7b0JBQy9CLEtBQUssRUFBRSxLQUFLO29CQUNaLEtBQUssRUFBRSxPQUFPO29CQUNkLFdBQVcsRUFBRSxvRUFBb0U7aUJBQ3BGLENBQUMsQ0FBQyxDQUFDO2dCQUNKLE9BQU87YUFDVjtZQUNELElBQUksQ0FBQyxJQUFBLHVCQUFXLEVBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO2dCQUNuQyxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO29CQUMvQixLQUFLLEVBQUUsS0FBSztvQkFDWixLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUsNkVBQTZFO2lCQUM3RixDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPO2FBQ1Y7WUFDRCxJQUFJLENBQUMsSUFBQSx1QkFBVyxFQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDaEMsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztvQkFDL0IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osS0FBSyxFQUFFLE9BQU87b0JBQ2QsV0FBVyxFQUFFLDBFQUEwRTtpQkFDMUYsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTzthQUNWO1lBRUQsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0scUJBQXFCLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzVGLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDbEQsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0IsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztvQkFDL0IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osS0FBSyxFQUFFLE9BQU87b0JBQ2QsV0FBVyxFQUFFLDJFQUEyRTtpQkFDM0YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTzthQUNWO1NBQ0o7UUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEsMEJBQWMsRUFBQyxPQUFPLEVBQUU7WUFDdEMsV0FBVyxFQUFFLElBQUEseUJBQVcsRUFBQTs7a0NBRUYsV0FBVztvQ0FDVCxVQUFVO2lDQUNiLE9BQU87a0NBQ04sU0FBUztpQ0FDVixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNsRTtZQUNELFNBQVMsRUFBRSx5REFBeUQ7U0FDdkUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsR0FBRztZQUFFLE9BQU87UUFDakIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLFNBQVMsRUFBRTtZQUN6QyxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUU7Z0JBQ3BCLE9BQU8sRUFBRSxvQkFBb0I7Z0JBQzdCLE1BQU0sRUFBRSxFQUFFO2FBQ2IsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsTUFBTSxHQUFHLEdBQXFCO1lBQzFCLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLFdBQVcsRUFBRSxFQUFFO1lBQzVCLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRTtZQUMxQixPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDcEIsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ3hCLFlBQVksRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUM1QyxDQUFDO1FBQ0YsSUFBSSxJQUFJO1lBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzs7WUFDaEMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLHNCQUFVLEVBQUM7WUFDL0IsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxrR0FBa0c7U0FDbEgsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQTZCLEVBQUUsSUFBd0I7UUFDM0UsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJO2VBQ2hCLHNCQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7UUFDckcsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxTQUFTLEVBQUUsNkNBQTZDO2dCQUN4RCxVQUFVLEVBQUUsNENBQTRDO2FBQzNELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUUxQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3pFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsTUFBTSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM1RixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLE1BQU0sSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDaEYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxNQUFNLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3hGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUV0RixNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxlQUFlO1lBQ2xDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztTQUM5RCxDQUFDO2FBQ0QsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLG9CQUFvQjtZQUMxQixLQUFLLEVBQUUsV0FBVztTQUNyQixFQUFFO1lBQ0MsSUFBSSxFQUFFLHNCQUFzQjtZQUM1QixLQUFLLEVBQUUsVUFBVTtTQUNwQixFQUFFO1lBQ0MsSUFBSSxFQUFFLG1CQUFtQjtZQUN6QixLQUFLLEVBQUUsT0FBTztTQUNqQixFQUFFO1lBQ0MsSUFBSSxFQUFFLG9CQUFvQjtZQUMxQixLQUFLLEVBQUUsU0FBUztTQUNuQixFQUFFO1lBQ0MsSUFBSSxFQUFFLG1CQUFtQjtZQUN6QixLQUFLLEVBQUUsZ0JBQWdCO1NBQzFCLENBQUM7YUFDRCxTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsNERBQTREO1NBQ3JFLENBQUMsQ0FBQztRQUVQLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQTZCLEVBQUUsSUFBd0I7UUFDN0UsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLHNCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFNBQVMsRUFBRSw2Q0FBNkM7Z0JBQ3hELFVBQVUsRUFBRSw0Q0FBNEM7YUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO1lBQy9CLEtBQUssRUFBRSxNQUFNO1lBQ2IsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLHlCQUF5QjtTQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDaEMsTUFBTSxXQUFXLEdBQXFCO1lBQ2xDLElBQUksRUFBRSxFQUFFO1lBQ1IsTUFBTSxFQUFFLEVBQUU7U0FDYixDQUFDO1FBRUYsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDeEMsTUFBTSxXQUFXLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxXQUFXO2dCQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztTQUN6RDtRQUVELElBQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3ZDLE1BQU0sVUFBVSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsVUFBVTtnQkFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7U0FDdkQ7UUFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLE9BQU87Z0JBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1NBQ2pEO1FBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxTQUFTO2dCQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUNyRDtRQUVELElBQUksV0FBVyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6RSxNQUFNLFlBQVksR0FBRyxzQkFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUN0RixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUMxRSxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssWUFBWSxDQUFDLE1BQU0sRUFBRTtnQkFDbEQsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO2FBQ2hEO1NBQ0o7UUFFRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQztRQUM5RSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUNsRixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLGdCQUFnQjtTQUNoQyxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFRDs7T0FFRztJQUNPLEtBQUssQ0FBQyxZQUFZLENBQ3hCLE9BQTZCLEVBQUUsSUFBd0IsRUFBRSxPQUE0QjtRQUVyRixNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNuQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUVoQyxJQUFJLElBQUk7WUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztZQUN4RCxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdkUsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLElBQUEscUJBQU8sRUFBQTtpREFDaUIsT0FBTyxDQUFDLFFBQVEsRUFBRTs7YUFFdEQ7U0FDSixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFRDs7T0FFRztJQUNPLEtBQUssQ0FBQyxZQUFZLENBQ3hCLE9BQTZCLEVBQUUsSUFBd0IsRUFBRSxJQUFrQjtRQUUzRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNuQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUVoQyxJQUFJLElBQUk7WUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztZQUNuRCxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbEUsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLElBQUEscUJBQU8sRUFBQTtxREFDcUIsSUFBSSxDQUFDLFFBQVEsRUFBRTs7YUFFdkQ7U0FDSixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFRDs7T0FFRztJQUNPLEtBQUssQ0FBQyxhQUFhLENBQ3pCLE9BQTZCLEVBQUUsSUFBd0IsRUFBRSxJQUFrQjtRQUUzRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNuQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUVoQyxJQUFJLElBQUk7WUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztZQUNwRCxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbkUsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLElBQUEscUJBQU8sRUFBQTsyREFDMkIsSUFBSSxDQUFDLFFBQVEsRUFBRTs7YUFFN0Q7U0FDSixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFRDs7T0FFRztJQUNPLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBNkIsRUFBRSxJQUF3QixFQUFFLElBQWtCO1FBQ2xHLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ25DLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBRWhDLElBQUksSUFBSTtZQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7O1lBQ2pELE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVoRSxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO1lBQy9CLEtBQUssRUFBRSxPQUFPO1lBQ2QsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsSUFBQSxxQkFBTyxFQUFBO3dEQUN3QixJQUFJLENBQUMsUUFBUSxFQUFFOzthQUUxRDtTQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUVEOztPQUVHO0lBQ08sS0FBSyxDQUFDLGdCQUFnQixDQUM1QixPQUE2QixFQUFFLElBQXdCLEVBQUUsY0FBc0I7UUFFL0UsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbkMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFFaEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBcUIsQ0FBQztRQUM5RixNQUFNLFFBQVEsR0FBRyxNQUFNLHFCQUFxQixDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUUsTUFBTSxZQUFZLEdBQUcsSUFBQSwwQkFBYyxFQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTFFLElBQUksSUFBSTtZQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDOztZQUM3QyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUUxRSxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO1lBQy9CLEtBQUssRUFBRSxPQUFPO1lBQ2QsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7YUFHbkI7WUFDRCxTQUFTLEVBQUUsZ0JBQWdCO1lBQzNCLFVBQVUsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDM0QsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0NBQ0o7QUFuZ0JELCtCQW1nQkM7QUFFRCxTQUFTLGVBQWUsQ0FDcEIsT0FBZSxFQUFFLEdBQU0sRUFBRSxLQUF1QztJQUVoRSxNQUFNLEdBQUcsR0FBcUI7UUFDMUIsS0FBSyxFQUFFLE9BQU87S0FDakIsQ0FBQztJQUNGLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDakIsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBRUQsS0FBSyxVQUFVLGdCQUFnQixDQUMzQixLQUFhLEVBQUUsT0FBd0IsRUFBRSxRQUFrQixFQUFFLElBQVE7SUFFckUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3BGLE9BQU8sWUFBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQztBQUNwRSxDQUFDO0FBRUQsS0FBSyxVQUFVLGFBQWEsQ0FDeEIsS0FBYSxFQUFFLE9BQXdCLEVBQUUsUUFBa0IsRUFBRSxJQUFRO0lBRXJFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztJQUNwRixNQUFNLE1BQU0sR0FBRyxZQUFZLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ3JFLE9BQU8sTUFBa0MsQ0FBQztBQUM5QyxDQUFDO0FBRUQsS0FBSyxVQUFVLG1CQUFtQixDQUM5QixLQUFhLEVBQUUsT0FBd0IsRUFBRSxPQUFxQixFQUFFLElBQVE7SUFFeEUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFhLENBQUM7SUFDNUQsT0FBTyxNQUFNLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBRUQsS0FBSyxVQUFVLHFCQUFxQixDQUNoQyxLQUFhLEVBQUUsT0FBd0IsRUFBRSxPQUFxQjtJQUU5RCxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDNUQsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFhLEVBQUUsY0FBYyxDQUFDLENBQzVGLENBQUMsQ0FBQztJQUNILE9BQU8sc0JBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBRUQsS0FBSyxVQUFVLHFCQUFxQixDQUNoQyxPQUF3QixFQUN4QixPQUFxQixFQUNyQixJQUFPLEVBQ1AsU0FBZ0UsRUFDaEUsWUFBK0IsRUFDL0IsSUFBYTtJQUViLElBQUksS0FBa0QsQ0FBQztJQUN2RCxJQUFJLGFBQWtDLENBQUM7SUFDdkMsT0FBTyxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNqQyxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsMEJBQWMsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLElBQUksQ0FBQztRQUN4QixhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLEtBQUssR0FBRyxNQUFNLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM1RTtJQUVELE1BQU0sYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBQzlCLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMifQ==