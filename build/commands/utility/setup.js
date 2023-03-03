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
        parse(value) {
            return value.toLowerCase();
        },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9zZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCwyQ0FBOEY7QUFFOUYscURBZXlCO0FBQ3pCLHFEQVMrQjtBQUUvQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRTtZQUNILE1BQU07WUFDTixNQUFNO1lBQ04sUUFBUTtZQUNSLFlBQVk7WUFDWixZQUFZO1lBQ1osYUFBYTtZQUNiLFVBQVU7WUFDVixtQkFBbUI7U0FDdEI7UUFDRCxPQUFPLEVBQUUsTUFBTTtRQUNmLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsT0FBTztRQUNaLE1BQU0sRUFBRSx1REFBdUQ7UUFDL0QsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUM7UUFDeEMsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBUyxFQUFFLE9BQXdCO1lBQ3ZDLE1BQU0sVUFBVSxHQUFHLElBQUEseUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sc0JBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLElBQUEseUJBQWEs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