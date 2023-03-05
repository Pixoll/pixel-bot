"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgDate = exports.hyperlink = exports.parseArgInput = exports.validateArgInput = exports.addOrdinalSuffix = exports.arrayWithLength = exports.removeRepeated = exports.isTrue = exports.getSubCommand = exports.parseMessageToCommando = exports.yesOrNo = exports.fetchPartial = exports.emptyObject = exports.enumToObject = exports.deepCopy = exports.applyDefaults = exports.confirmButtons = exports.generateEmbed = exports.pagedEmbed = exports.docId = exports.isValidRole = exports.validateURL = exports.difference = exports.compareArrays = exports.arrayEquals = exports.sliceDots = exports.pluralize = exports.getKeyPerms = exports.isModerator = exports.inviteButton = exports.memberException = exports.userException = exports.getArgument = exports.basicCollector = exports.replyAll = exports.timestamp = exports.basicEmbed = exports.customEmoji = exports.isGuildModuleEnabled = exports.removeDashes = exports.addDashes = exports.code = exports.abcOrder = exports.sleep = void 0;
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const lodash_1 = require("lodash");
const common_tags_1 = require("common-tags");
const better_ms_1 = require("better-ms");
const constants_1 = require("./constants");
//#endregion
/**
 * Pauses the command's execution
 * @param s Amount of seconds
 */
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}
exports.sleep = sleep;
/**
 * Orders an array in alphabetical order
 * @param a The first string
 * @param b The seconds string
 */
function abcOrder(a, b) {
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}
exports.abcOrder = abcOrder;
/**
 * Parses a string to have code block style
 * @param text The string to parse
 * @param lang The language to use for this block
 */
function code(text, lang = '') {
    return `\`\`\`${lang}\n${(0, discord_js_1.escapeMarkdown)(text)}\n\`\`\``;
}
exports.code = code;
/**
 * Adds dashes to the string on every upper case letter
 * @param str The string to parse
 * @param under Wether to use underscores instead or not
 */
function addDashes(str, under = false) {
    if (str.length === 0)
        return str;
    if (typeof under !== 'boolean')
        under = false;
    return str.replace(/[A-Z]/g, under ? '_$&' : '-$&').toLowerCase();
}
exports.addDashes = addDashes;
/**
 * Removes dashes from the string and capitalizes the remaining strings
 * @param str The string to parse
 */
function removeDashes(str) {
    if (str.length === 0)
        return str;
    const arr = str.split('-');
    const first = arr.shift();
    const rest = arr.map(lodash_1.capitalize).join('');
    return first + rest;
}
exports.removeDashes = removeDashes;
/**
 * Checks if a guild module is enabled
 * @param guild The guild to look into
 * @param module The module to check
 * @param subModule The sub-module to check
 */
async function isGuildModuleEnabled(guild, module, subModule) {
    const data = await guild.database.modules.fetch();
    if (!data)
        return false;
    const moduleName = removeDashes(module);
    const subModuleName = subModule ? removeDashes(subModule) : null;
    const toCheck = moduleName === 'auditLogs' && subModuleName
        ? data[moduleName]?.[subModuleName]
        : data[moduleName];
    if (typeof toCheck === 'object') {
        const status = [];
        for (const prop of Object.keys(toCheck)) {
            if (typeof toCheck[prop] === 'function')
                continue;
            status.push(!!toCheck[prop]);
        }
        return !!status.filter(b => b)[0];
    }
    return !!toCheck;
}
exports.isGuildModuleEnabled = isGuildModuleEnabled;
/**
 * Returns a certain emoji depending on the specified string.
 * @param emoji The emoji you want to get.
 * @param animated If the emoji you want is animated.
 */
function customEmoji(emoji, animated = false) {
    if (!emoji)
        return '';
    switch (emoji) {
        case 'boost': return '<a:boost:806364586231595028>';
        case 'bot': return '<:bot1:893998060965883904><:bot2:893998060718399528>';
        case 'check': {
            if (animated)
                return '<a:check:863118691808706580>';
            return '<:check:802617654396715029>';
        }
        case 'cross': {
            if (animated)
                return '<a:cross:863118691917889556>';
            return '<:cross:802617654442852394>';
        }
        case 'dnd': return '<:dnd:806022690284240936>';
        case 'idle': return '<:idle:806022690443624458>';
        case 'info': return '<:info:802617654262890527>';
        case 'invis': return '<:invis:806022690326315078>';
        case 'loading': return '<a:loading:863666168053366814>';
        case 'neutral': return '<:neutral:819395069608984617>';
        case 'online': return '<:online:806022690196291625>';
        default: return emoji;
    }
}
exports.customEmoji = customEmoji;
/**
 * Creates a basic custom embed.
 * @param options Options for the embed.
 */
function basicEmbed(options) {
    const { color = '#4c9f4c', description, emoji, fieldName, fieldValue, footer } = options;
    if (!description && !fieldName)
        throw new Error('The argument description or fieldName must be specified');
    const emojiString = customEmoji(emoji);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(color);
    if (description)
        embed.setDescription(`${emojiString} ${description}`);
    if (fieldName) {
        if (!fieldValue)
            throw new Error('The argument fieldValue must be specified');
        embed.addFields({
            name: description ? fieldName : `${emojiString} ${fieldName}`,
            value: fieldValue,
        });
    }
    if (footer)
        embed.setFooter({ text: footer });
    return embed;
}
exports.basicEmbed = basicEmbed;
/**
 * Parses the specified time into a Discord template
 * @param time The time to parse (in milliseconds)
 * @param format The format of the timestamp
 * - `t`: Short time ➜ `16:20`
 * - `T`: Long time ➜ `16:20:30`
 * - `d`: Short date ➜ `20/04/2021`
 * - `D`: Long date ➜ `20 April 2021`
 * - `f`: Short date/time ➜ `20 April 2021 16:20`
 * - `F`: Long date/time ➜ `Tuesday, 20 April 2021 16:20`
 * - `R`: Relative time ➜ `2 months ago`
 * @param exact Whether the timestamp should be exact and not rounded
 */
function timestamp(time, format, exact = false) {
    if (time instanceof Date)
        time = time.getTime();
    const chosenFormat = format ?? 'f';
    const trunc = Math.trunc(time / 1000);
    if (exact)
        return `<t:${trunc}:${chosenFormat}>`;
    const rem = trunc % 60;
    const epoch = trunc - rem;
    return `<t:${epoch}:${chosenFormat}>`;
}
exports.timestamp = timestamp;
/**
 * Replies to the corresponding context
 * @param context The command context to reply
 * @param options The options of the message
 */
async function replyAll(context, options) {
    if (options instanceof discord_js_1.EmbedBuilder)
        options = { embeds: [options] };
    if (typeof options === 'string')
        options = { content: options };
    if (context.isInteraction()) {
        if (context.isEditable()) {
            return await context.editReply(options).catch(() => null);
        }
        return await context.reply(options).catch(() => null);
    }
    const messageOptions = {
        ...options,
        ...pixoll_commando_1.Util.noReplyPingInDMs(context),
    };
    if (options.editReply)
        return await context.edit(messageOptions).catch(() => null);
    return await context.reply(messageOptions).catch(() => null);
}
exports.replyAll = replyAll;
/**
 * Creates a basic collector with the given parameters.
 * @param context The command context
 * @param embedOptions The options for the response messages.
 * @param collectorOptions The collector's options.
 * @param shouldDelete Whether the prompt should be deleted after it gets a value or not.
 */
async function basicCollector(context, embedOptions, collectorOptions = {}, shouldDelete) {
    const { author, channelId, client } = context;
    collectorOptions ??= {};
    collectorOptions.time ??= 30 * 1000;
    collectorOptions.max ??= 1;
    collectorOptions.filter ??= (m) => m.author.id === author.id;
    embedOptions.color ??= 'Blue';
    embedOptions.fieldValue ??= 'Respond with `cancel` to cancel the command.';
    embedOptions.footer ??= `The command will automatically be cancelled in ${(0, better_ms_1.prettyMs)(collectorOptions.time, {
        verbose: true,
        unitCount: 1,
    })}`;
    const toDelete = await replyAll(context, basicEmbed(embedOptions));
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        throw new Error(`Unknown channel ${channelId}`);
    }
    const messages = await channel.awaitMessages(collectorOptions);
    if (context.isMessage() && shouldDelete)
        await toDelete?.delete().catch(() => null);
    if (messages.size === 0) {
        await replyAll(context, { content: 'You didn\'t answer in time.', embeds: [] });
        return null;
    }
    if (messages.first()?.content.toLowerCase() === 'cancel') {
        await replyAll(context, { content: 'Cancelled command.', embeds: [] });
        return null;
    }
    return messages.first() ?? null;
}
exports.basicCollector = basicCollector;
/**
 * Get's a single argument
 * @param message The message to get the argument from
 * @param arg The argument to get
 */
async function getArgument(message, arg) {
    if (!arg)
        return null;
    const initialValue = arg.required;
    arg.required = true;
    const response = await arg.obtain(message, '');
    arg.required = initialValue;
    if (response.cancelled)
        await message.reply({
            content: 'Cancelled command.',
            ...pixoll_commando_1.Util.noReplyPingInDMs(message),
        });
    return response;
}
exports.getArgument = getArgument;
/**
 * Makes sure the moderation command is usable by the user
 * @param user The user targeted in the the command
 * @param author The user who ran the command
 * @param command The command that's being ran
 */
function userException(user, author, command) {
    const { client, name } = command;
    if (user.id !== client.user?.id && user.id !== author.id)
        return null;
    return {
        color: 'Red',
        emoji: 'cross',
        description: user.id === author.id
            ? `You can't ${name} yourself.`
            : `You can't make me ${name} myself.`,
    };
}
exports.userException = userException;
/**
 * Makes sure the moderation command is usable by the member
 * @param member The targeted member
 * @param moderator The member who ran the command
 * @param command The command that's being ran
 */
function memberException(member, moderator, command) {
    if (!member)
        return null;
    const { client, name } = command;
    const options = {
        color: 'Red',
        emoji: 'cross',
        description: '',
    };
    if (!member.bannable) {
        options.fieldName = `Unable to ${name} ${member.user.tag}`;
        options.fieldValue = 'Please check the role hierarchy or server ownership.';
        return options;
    }
    if (client.isOwner(moderator))
        return null;
    const highestTarget = member.roles.highest;
    const highestMod = moderator.roles.highest;
    const bannable = highestMod.comparePositionTo(highestTarget) > 0;
    if (!bannable || client.isOwner(member)) {
        options.fieldName = `You can't ${name} ${member.user.tag}`;
        options.fieldValue = 'Please check the role hierarchy or server ownership.';
        return options;
    }
    if (isModerator(member)) {
        options.description = `That user is a mod/admin, you can't ${name} them.`;
        return options;
    }
    return null;
}
exports.memberException = memberException;
/**
 * Creates a {@link ActionRowBuilder} with a {@link ButtonBuilder} with the provided invite
 * @param invite The invite to user for the button
 * @param label The label of the button
 */
function inviteButton(invite, label = 'Join back') {
    return new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setLabel(label)
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setURL(invite.toString()));
}
exports.inviteButton = inviteButton;
/**
 * Checks if the role or member is considered a moderator by checking their permissions.
 * @param roleOrMember A role or member.
 * @param noAdmin Whether to skip the `ADMINISTRATOR` permission or not.
 */
function isModerator(roleOrMember, noAdmin) {
    if (!roleOrMember)
        return false;
    const { permissions } = roleOrMember;
    const values = [];
    if (noAdmin) {
        for (const condition of constants_1.moderatorPermissions) {
            values.push(permissions.has(condition));
        }
        const isTrue = values.filter(b => b === true)[0] ?? false;
        return !permissions.has('Administrator') && isTrue;
    }
    if (permissions.has('Administrator'))
        return true;
    for (const condition of constants_1.moderatorPermissions) {
        values.push(permissions.has(condition));
    }
    const isTrue = values.filter(b => b === true)[0] ?? false;
    return isTrue;
}
exports.isModerator = isModerator;
/**
 * Gets the mod permissions from a role or member.
 * @param roleOrMember A role or member.
 */
function getKeyPerms(roleOrMember) {
    const perms = roleOrMember.permissions;
    if (perms.has('Administrator'))
        return 'Administrator';
    const filtered = perms.toArray().filter(perm => constants_1.moderatorPermissions.includes(perm));
    if (filtered.length === 0)
        return 'None';
    return filtered.map(perm => pixoll_commando_1.Util.permissions[perm]).join(', ');
}
exports.getKeyPerms = getKeyPerms;
/**
 * Pluralizes a string, adding `s` or `es` at the end of it
 * @param string The string to pluralize
 * @param number The number to check with
 * @param showNum If it should show the number
 */
function pluralize(string, number, showNum = true) {
    if (number === 1) {
        if (!showNum)
            return string;
        return `${number} ${string}`;
    }
    let es;
    for (const end of ['ch', 'sh', 's', 'x', 'z']) {
        if (string.endsWith(end))
            es = true;
    }
    if (!showNum)
        return string + (es ? 'es' : 's');
    return `${number} ${string}${es ? 'es' : 's'}`;
}
exports.pluralize = pluralize;
/**
 * Slices the string at the specified length, and adds `...` if the length of the original is greater than the modified
 * @param string The string to slice
 * @param length The length of the sliced string
 */
function sliceDots(string, length) {
    if (string.length === 0)
        return '';
    const og = string;
    const sliced = string.slice(0, length - 3);
    const dots = og.length > sliced.length ? '...' : '';
    return sliced + dots;
}
exports.sliceDots = sliceDots;
// /**
//  * Checks if the whole embed's structure exceeds the maximum string length (6,000).
//  * @param {MessageEmbed} embed The embed to check.
//  */
// function embedExceedsMax(embed) {
//     const { title, description, fields, footer, author } = embed
//     let length = 0
//     if (title) {
//         length += title.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'title', index: null }
//         }
//     }
//     if (description) {
//         length += description.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'description', index: null }
//         }
//     }
//     if (footer?.text) {
//         length += footer.text.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'footer.text', index: null }
//         }
//     }
//     if (author?.name) {
//         length += author.name.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'author.name', index: null }
//         }
//     }
//     for (let i = 0; i < fields.length; i++) {
//         const field = fields[i]
//         length += field.name.length
//         length += field.value.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'fields', index: i }
//         }
//     }
//     return { exceeded: false, trigger: null, index: null }
// }
/**
 * Compares if two arrays have the same *fist level* values.
 * @param first The first array.
 * @param second The second array.
 */
function arrayEquals(first, second) {
    if (first.length !== second.length)
        return false;
    const uniqueValues = new Set([...first, ...second]);
    for (const value of uniqueValues) {
        const aCount = first.filter(e => e === value).length;
        const bCount = second.filter(e => e === value).length;
        if (aCount !== bCount)
            return false;
    }
    return true;
}
exports.arrayEquals = arrayEquals;
/**
 * Compares and returns the difference between a set of arrays
 * @param oldArr The old array
 * @param newArr The new array
 * @returns `[added, removed]`
 */
function compareArrays(oldArr, newArr) {
    const map1 = new Map();
    oldArr.forEach(e => map1.set(e, true));
    const added = newArr.filter(e => !map1.has(e));
    const map2 = new Map();
    newArr.forEach(e => map2.set(e, true));
    const removed = oldArr.filter(e => !map2.has(e));
    return [added, removed];
}
exports.compareArrays = compareArrays;
/**
 * Compares if two objects are equal and returns the differences.
 * @param first The first object.
 * @param second The second object.
 */
function difference(first, second) {
    let arrayIndexCounter = 0;
    return (0, lodash_1.transform)(second, (result, value, key) => {
        if ((0, lodash_1.isEqual)(value, first[key]))
            return;
        const resultKey = Array.isArray(first) ? arrayIndexCounter++ : key;
        // @ts-expect-error: from Stack Overflow, works
        result[resultKey] = (0, lodash_1.isObject)(value) && (0, lodash_1.isObject)(first[key]) ? difference(value, first[key]) : value;
    });
}
exports.difference = difference;
/** Checks whether the string is a valid URL.
 * @param str The string to verify.
 */
function validateURL(str) {
    if (!str.includes('.') || !str.includes('/'))
        return false;
    return constants_1.validateUrlPattern.test(str);
}
exports.validateURL = validateURL;
/**
 * Validates a {@link Role} to be used in commands
 * @param message The message instance
 * @param role The role to validate
 */
function isValidRole(message, role) {
    if (!message.inGuild() || !(role instanceof discord_js_1.Role) || !role || role.managed)
        return false;
    const { member, client, author, guild } = message;
    const botId = client.user.id;
    const botManageable = guild.members.me?.roles.highest.comparePositionTo(role);
    if (pixoll_commando_1.Util.isNullish(botManageable) || botManageable < 1)
        return false;
    const isOwner = author.id === botId;
    if (isOwner)
        return true;
    const memberManageable = member?.roles.highest.comparePositionTo(role);
    if (pixoll_commando_1.Util.isNullish(memberManageable) || memberManageable < 1)
        return false;
    if (isModerator(role))
        return false;
    return true;
}
exports.isValidRole = isValidRole;
/**
 * Creates a random Mongo document ID.
 */
function docId() {
    const int = Math.floor(Math.random() * (2 ** 48));
    return int.toString(16);
}
exports.docId = docId;
/**
 * Creates a basic paged embed with the template provided.
 * @param context The command context
 * @param options Options for the paged embed.
 * @param template The embed template to use.
 */
async function pagedEmbed(context, options, template) {
    const { channelId, id, author, client } = context;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        throw new Error(`Unknown channel ${channelId}`);
    }
    const isDMs = channel.isDMBased();
    const targetChannel = options.toUser ? await author.createDM() : channel;
    options.components ??= [];
    const ids = {
        start: `${id}:page_start`,
        down: `${id}:page_down`,
        up: `${id}:page_up`,
        end: `${id}:page_end`,
    };
    const pageStart = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setCustomId(ids.start)
        .setEmoji('⏪')
        .setDisabled();
    const pageDown = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setCustomId(ids.down)
        .setEmoji('⬅️')
        .setDisabled();
    const pageUp = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setCustomId(ids.up)
        .setEmoji('➡️');
    const pageEnd = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setCustomId(ids.end)
        .setEmoji('⏩');
    const buttons = options.total <= options.number ? null : new discord_js_1.ActionRowBuilder()
        .addComponents(options.skipMaxButtons
        ? [pageDown, pageUp] : [pageStart, pageDown, pageUp, pageEnd]);
    if (options.toUser && !isDMs) {
        await replyAll(context, (0, common_tags_1.stripIndent) `
            ${options.dmMsg || ''}
            **Didn\'t get the DM?** Then please allow DMs from server members.
        `);
    }
    if (context.isMessage()) {
        await targetChannel.sendTyping().catch(() => null);
    }
    const first = await template(0);
    const msgOptions = {
        embeds: [first.embed],
        components: pixoll_commando_1.Util.filterNullishItems([...options.components, buttons]),
    };
    const msg = options.toUser && !isDMs
        ? await targetChannel.send(msgOptions).catch(() => null)
        : await replyAll(context, msgOptions);
    if (!msg || (options.total <= options.number && !options.components[0]))
        return;
    let index = 0;
    const collector = targetChannel.createMessageComponentCollector({
        async filter(int) {
            if (msg.id !== int.message?.id)
                return false;
            if (!int.isButton() && !int.isStringSelectMenu())
                return false;
            if (int.user.id === author.id)
                return true;
            await int.reply({
                content: 'This interaction doesn\'t belong to you.', ephemeral: true,
            });
            return false;
        },
        time: 60 * 1000,
    });
    const disableButton = (target, disabled = true) => {
        const button = buttons?.components.find(b => {
            const apiButton = b.toJSON();
            if (!('custom_id' in apiButton))
                return false;
            return apiButton.custom_id.endsWith(target);
        });
        if (!button)
            return;
        button.setDisabled(disabled);
    };
    const menuOptions = options.components[0]?.components
        .filter((c) => c instanceof discord_js_1.StringSelectMenuBuilder)
        .at(0)
        ?.options.map(op => op.data.value ?? '') ?? [];
    let option = 'all';
    collector.on('collect', async (int) => {
        if (int.isButton()) {
            const oldData = await template(index, option);
            if (typeof oldData.total !== 'number')
                oldData.total = options.total;
            if (int.customId === ids.start) {
                index = 0;
                disableButton('up', false);
                disableButton('end', false);
                disableButton('down');
                disableButton('start');
            }
            if (int.customId === ids.down) {
                index -= options.number;
                disableButton('up', false);
                disableButton('end', false);
                if (index === 0) {
                    disableButton('down');
                    disableButton('start');
                }
            }
            if (int.customId === ids.up) {
                index += options.number;
                disableButton('down', false);
                disableButton('start', false);
                if (index >= oldData.total - options.number) {
                    disableButton('up');
                    disableButton('end');
                }
            }
            if (int.customId === ids.end) {
                const newIndex = oldData.total - (oldData.total % options.number);
                index = oldData.total === newIndex ? newIndex - options.number : newIndex;
                disableButton('down', false);
                disableButton('start', false);
                disableButton('up');
                disableButton('end');
            }
            const templateData = await template(index, option);
            await int.update({
                embeds: [templateData.embed],
                components: pixoll_commando_1.Util.filterNullishItems([...(options.components ?? []), buttons]),
                ...pixoll_commando_1.Util.noReplyPingInDMs(msg),
            }).catch(() => null);
            return;
        }
        if (int.isStringSelectMenu()) {
            option = menuOptions.find(op => op === int.values[0]);
            const templateData = await template(0, option);
            disableButton('up', templateData.total <= options.number);
            disableButton('end', templateData.total <= options.number);
            disableButton('down');
            disableButton('start');
            await int.update({
                embeds: [templateData.embed],
                components: pixoll_commando_1.Util.filterNullishItems([...(options.components ?? []), buttons]),
                ...pixoll_commando_1.Util.noReplyPingInDMs(msg),
            }).catch(() => null);
            return;
        }
    });
    collector.on('end', async () => {
        if (msg)
            await msg.edit({ components: [] }).catch(() => null);
        else
            replyAll(context, { components: [] }).catch(() => null);
    });
}
exports.pagedEmbed = pagedEmbed;
/**
 * Generates a paged embed based off the `array` and `embedOptions`
 * @param context The command context
 * @param array The array that contains the data to be displayed
 * @param options Some extra data for the embed
 */
async function generateEmbed(context, array, options) {
    const { channels } = context.client;
    const { number, color, authorName, authorIconURL, useDescription, title, inline, toUser, dmMsg, hasObjects, keyTitle, keys, keysExclude, useDocId, components, embedTitle, skipMaxButtons, numbered, } = applyDefaults(constants_1.defaultGenerateEmbedOptions, options);
    if (array.length === 0)
        throw new Error('array cannot be empty');
    keysExclude.push(...pixoll_commando_1.Util.filterNullishItems([
        keyTitle.prefix, keyTitle.suffix, '_id', '__v',
    ]));
    const objFilter = (key) => {
        return (keys ? keys.includes(key) : !!key) && !keysExclude.includes(key);
    };
    await pagedEmbed(context, {
        number,
        total: array.length,
        toUser,
        dmMsg,
        components,
        skipMaxButtons,
    }, async (start, filter) => {
        const data = ((!filter || filter === 'all')
            ? array
            : array.filter(doc => typeof doc === 'object' && 'type' in doc && doc.type === filter));
        const pages = Math.trunc(data.length / number) + ((data.length / number) % 1 === 0 ? 0 : 1);
        const current = data.slice(start, start + number);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(color)
            .setTimestamp();
        if (embedTitle)
            embed.setTitle(embedTitle);
        if (authorName) {
            embed.setAuthor({
                name: authorName,
                iconURL: authorIconURL ?? undefined,
            });
        }
        if (pages > 1)
            embed.setFooter({ text: `Page ${Math.round(start / number + 1)} of ${pages}` });
        if (useDescription) {
            return {
                embed: embed.setDescription(current.join('\n')),
                total: data.length,
            };
        }
        if (data.length === 0) {
            return {
                embed: embed.addFields({
                    name: 'There\'s nothing to see here',
                    value: 'Please try with another filter.',
                }),
                total: data.length,
            };
        }
        let index = 0;
        for (const item of current) {
            const isObject = typeof item === 'object';
            const objKeys = hasObjects
                ? Object.keys(isObject && '_doc' in item ? item._doc : item).filter(objFilter)
                : [];
            const docId = useDocId && isObject
                ? (typeof item._doc === 'object' && item._doc
                    ? item._doc?._id
                    : item._id)
                : null;
            const numberPrefix = numbered ? `${start + index + 1}.` : '';
            const prefix = isObject && keyTitle?.prefix
                ? (0, lodash_1.capitalize)(item[keyTitle?.prefix])
                : '';
            const suffix = docId || (!keyTitle?.suffix || !isObject ? start + index + 1
                : ((item[keyTitle?.suffix] && typeof item[keyTitle?.suffix] !== 'string'
                    ? timestamp(item[keyTitle?.suffix] / 1)
                    : null) || item[keyTitle?.suffix]));
            const value = [];
            for (const key of objKeys) {
                const objectItem = item;
                if (objKeys.length === 1) {
                    value.push(objectItem[key]);
                    break;
                }
                const propName = (0, lodash_1.capitalize)(key.replace('createdAt', 'date')).replace('id', '');
                if (propName.endsWith('tag'))
                    continue;
                const userStr = key === 'userId' ? `<@${objectItem.userId}> ${objectItem.userTag}` : null;
                const modStr = key === 'modId' ? `<@${objectItem.modId}> ${objectItem.modTag}` : null;
                const channel = key === 'channel' ? channels.resolve(objectItem[key]) : null;
                const created = key === 'createdAt' ? timestamp(objectItem[key]) : null;
                const duration = key === 'duration' && Number(objectItem[key])
                    ? (0, better_ms_1.prettyMs)(objectItem[key], {
                        verbose: true,
                        unitCount: 2,
                    })
                    : null;
                const endsAt = key === 'endsAt'
                    ? `${timestamp(objectItem[key])} (${timestamp(objectItem[key], 'R')})`
                    : null;
                const docData = userStr || modStr || channel?.toString() || created || duration || endsAt || objectItem[key];
                value.push(`**${propName}:** ${docData}`);
            }
            embed.addFields({
                name: `${numberPrefix} ${prefix} ${title} ${suffix}`.replace(/ +/g, ' '),
                value: `${value.length !== 0 ? value.join('\n') : item}`,
                inline: inline,
            });
            index++;
        }
        return {
            embed,
            total: data.length,
        };
    });
}
exports.generateEmbed = generateEmbed;
/**
 * Creates and manages confirmation buttons (y/n) for moderation actions
 * @param context The command context
 * @param options The button options
 */
async function confirmButtons(context, options) {
    const { id, author } = context;
    const { action, target, reason, duration, sendCancelled = true } = options;
    const ids = {
        yes: `${id}:yes`,
        no: `${id}:no`,
    };
    const targetStr = target instanceof discord_js_1.User ? target.tag
        : target instanceof pixoll_commando_1.CommandoGuild ? target.name : target || null;
    const confirmEmbed = new discord_js_1.EmbedBuilder()
        .setColor('Gold')
        .setFooter({
        text: 'The command will automatically be cancelled in 30 seconds.',
    });
    if (!targetStr && !reason && !duration) {
        confirmEmbed.setDescription(`**Are you sure you want to ${action}?**`);
    }
    else {
        confirmEmbed.addFields({
            name: `Are you sure you want to ${action}${targetStr ? ` ${targetStr}` : ''}?`,
            value: (0, common_tags_1.stripIndent) `
                ${!targetStr ? '' : target instanceof discord_js_1.User ? (0, common_tags_1.stripIndent) `
                    **User:** ${target.toString()} ${target.tag}
                    **ID:** ${target.id}
                ` : `**Target:** ${targetStr}`}
                **Action:** ${action}
                ${reason ? `**Reason:** ${reason}` : ''}
                ${duration ? `**Duration:** ${duration}` : ''}
            `,
        });
    }
    const yesButton = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setCustomId(ids.yes)
        .setEmoji(customEmoji('check'));
    const noButton = new discord_js_1.ButtonBuilder()
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setCustomId(ids.no)
        .setEmoji(customEmoji('cross'));
    const msg = await replyAll(context, {
        embeds: [confirmEmbed],
        components: [new discord_js_1.ActionRowBuilder().addComponents(yesButton, noButton)],
    });
    const pushed = await msg?.awaitMessageComponent({
        filter: async (int) => {
            if (msg?.id !== int.message?.id)
                return false;
            if (int.user.id !== author.id) {
                await int.reply({
                    content: 'This interaction doesn\'t belong to you.', ephemeral: true,
                });
                return false;
            }
            return true;
        },
        time: 30000,
        componentType: discord_js_1.ComponentType.Button,
    }).catch(() => null);
    if (context.isMessage())
        await msg?.delete();
    await replyAll(context, { components: [] });
    if (!pushed || pushed.customId === ids.no) {
        if (sendCancelled) {
            await replyAll(context, {
                content: 'Cancelled command.', embeds: [],
            });
        }
        return false;
    }
    if (context.isMessage()) {
        await context.channel.sendTyping().catch(() => null);
    }
    return true;
}
exports.confirmButtons = confirmButtons;
function applyDefaults(from, to) {
    return Object.assign(deepCopy(from), to);
}
exports.applyDefaults = applyDefaults;
function deepCopy(value) {
    return JSON.parse(JSON.stringify(value));
}
exports.deepCopy = deepCopy;
function enumToObject(o) {
    return Object.keys(o)
        .filter((k) => typeof k !== 'number')
        .reduce((r, k) => (r[k] = o[k], r), emptyObject());
}
exports.enumToObject = enumToObject;
function emptyObject() {
    return JSON.parse('{}');
}
exports.emptyObject = emptyObject;
async function fetchPartial(object) {
    return (!object.partial
        ? object
        : await object.fetch().catch(() => null));
}
exports.fetchPartial = fetchPartial;
function yesOrNo(value) {
    return (value ? 'Yes ➜ No' : 'No ➜ Yes');
}
exports.yesOrNo = yesOrNo;
function parseMessageToCommando(message) {
    const commandoMessage = new pixoll_commando_1.CommandoMessage(message.client, message);
    // @ts-expect-error: parseMessage is protected in CommandoDispatcher
    const parsedMessage = message.client.dispatcher.parseMessage(commandoMessage);
    return parsedMessage;
}
exports.parseMessageToCommando = parseMessageToCommando;
function getSubCommand(message, defaultSubCommand) {
    return (pixoll_commando_1.CommandoMessage.parseArgs(message.content).map(s => s.toLowerCase())[1]
        ?? defaultSubCommand);
}
exports.getSubCommand = getSubCommand;
function isTrue(b) {
    return b === true;
}
exports.isTrue = isTrue;
function removeRepeated(array) {
    return Array.from(new Set(array));
}
exports.removeRepeated = removeRepeated;
function arrayWithLength(length, mapCallback) {
    const array = Array.from(Array(length).keys()).map(n => n + 1);
    if (!mapCallback)
        return array;
    return array.map(mapCallback);
}
exports.arrayWithLength = arrayWithLength;
function addOrdinalSuffix(n) {
    if (pixoll_commando_1.Util.equals(n % 100, [11, 12, 13]))
        return `${n}th`;
    const lastDigit = n % 10;
    if (lastDigit === 1)
        return `${n}st`;
    if (lastDigit === 2)
        return `${n}nd`;
    if (lastDigit === 3)
        return `${n}rd`;
    return `${n}th`;
}
exports.addOrdinalSuffix = addOrdinalSuffix;
async function validateArgInput(value, message, argument, type) {
    const argumentType = type ? message.client.registry.types.get(type) : argument.type;
    return argumentType?.validate(value, message, argument) ?? true;
}
exports.validateArgInput = validateArgInput;
async function parseArgInput(value, message, argument, type) {
    const argumentType = type ? message.client.registry.types.get(type) : argument.type;
    const result = argumentType?.parse(value, message, argument) ?? null;
    return result;
}
exports.parseArgInput = parseArgInput;
function hyperlink(content, url) {
    if (url)
        return `[${content}](${url})`;
    return content;
}
exports.hyperlink = hyperlink;
async function parseArgDate(context, command, argumentIndex, value, defaultValue) {
    if (context.isMessage() || pixoll_commando_1.Util.isNullish(value))
        return value;
    const message = await context.fetchReply();
    const argument = command.argsCollector?.args[argumentIndex];
    const type = argument?.type?.id.split('|')[0];
    const resultDate = await argument?.parse(value?.toString() ?? defaultValue ?? '', message).catch(() => null);
    if (pixoll_commando_1.Util.isNullish(resultDate)) {
        await replyAll(context, basicEmbed({
            color: 'Red',
            emoji: 'cross',
            description: `The ${type} you specified is invalid.`,
        }));
        return null;
    }
    return resultDate;
}
exports.parseArgDate = parseArgDate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FrQm9CO0FBQ3BCLHFEQWdCeUI7QUFDekIsbUNBQWtFO0FBQ2xFLDZDQUEwQztBQUMxQyx5Q0FBcUM7QUFFckMsMkNBQW9HO0FBMkxwRyxZQUFZO0FBRVo7OztHQUdHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLENBQVM7SUFDM0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUZELHNCQUVDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFFBQVEsQ0FBQyxDQUFTLEVBQUUsQ0FBUztJQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEIsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDO0FBSkQsNEJBSUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsRUFBRTtJQUN4QyxPQUFPLFNBQVMsSUFBSSxLQUFLLElBQUEsMkJBQWMsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQzVELENBQUM7QUFGRCxvQkFFQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixTQUFTLENBQTRCLEdBQVcsRUFBRSxLQUFLLEdBQUcsS0FBSztJQUMzRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU8sR0FBUSxDQUFDO0lBQ3RDLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUztRQUFFLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDOUMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFD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