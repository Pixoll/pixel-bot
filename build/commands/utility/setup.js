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
            detailedDescription: (0, common_tags_1.stripIndent) `
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
                await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen muted role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!(0, utils_1.isValidRole)(message, memberRole)) {
                await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default member role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!(0, utils_1.isValidRole)(message, botRole)) {
                await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default bot role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            lockChannels.push(...await parseLockdownChannels(fullData.lockdownChannels, message, this));
            lockChannels.splice(30, lockChannels.length - 30);
            if (lockChannels.length === 0) {
                await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, {
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            .setColor(utils_1.pixelColor)
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
        await (0, utils_1.reply)(context, embed);
    }
    /**
     * The `reload` sub-command
     */
    async runReload(context, data) {
        if (!data) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.',
            }));
            return;
        }
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        const message = await (0, utils_1.getContextMessage)(context);
        const channels = await parseLockdownChannels(channelsString, message, this);
        const lockChannels = (0, utils_1.removeRepeated)(channels.map(c => c.id)).slice(0, 30);
        if (data)
            await db.update(data, { lockChannels });
        else
            await db.add(defaultDocument(guildId, 'lockChannels', lockChannels));
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9zZXR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCwyQ0FBaUg7QUFFakgscURBY3lCO0FBQ3pCLHVDQWFxQjtBQUVyQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRTtZQUNILE1BQU07WUFDTixNQUFNO1lBQ04sUUFBUTtZQUNSLFlBQVk7WUFDWixZQUFZO1lBQ1osYUFBYTtZQUNiLFVBQVU7WUFDVixtQkFBbUI7U0FDdEI7UUFDRCxPQUFPLEVBQUUsTUFBTTtRQUNmLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsT0FBTztRQUNaLE1BQU0sRUFBRSx1REFBdUQ7UUFDL0QsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUM7UUFDeEMsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBVSxFQUFFLE9BQXdCO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sc0JBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFh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