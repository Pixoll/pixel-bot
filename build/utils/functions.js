"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRepeated = exports.isTrue = exports.getSubCommand = exports.parseMessageToCommando = exports.yesOrNo = exports.fetchPartial = exports.emptyObject = exports.enumToObject = exports.deepCopy = exports.applyDefaults = exports.confirmButtons = exports.generateEmbed = exports.pagedEmbed = exports.docId = exports.isValidRole = exports.validateURL = exports.difference = exports.compareArrays = exports.arrayEquals = exports.sliceDots = exports.pluralize = exports.getKeyPerms = exports.isModerator = exports.inviteButton = exports.memberException = exports.userException = exports.getArgument = exports.basicCollector = exports.replyAll = exports.timestamp = exports.basicEmbed = exports.customEmoji = exports.isGuildModuleEnabled = exports.removeDashes = exports.addDashes = exports.code = exports.abcOrder = exports.sleep = void 0;
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
    if (!(role instanceof discord_js_1.Role) || !role || role.managed)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FrQm9CO0FBQ3BCLHFEQWV5QjtBQUN6QixtQ0FBa0U7QUFDbEUsNkNBQTBDO0FBQzFDLHlDQUFxQztBQUVyQywyQ0FBb0c7QUEwTHBHLFlBQVk7QUFFWjs7O0dBR0c7QUFDSCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRkQsc0JBRUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLENBQVMsRUFBRSxDQUFTO0lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwQixPQUFPLENBQUMsQ0FBQztBQUNiLENBQUM7QUFKRCw0QkFJQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixJQUFJLENBQUMsSUFBWSxFQUFFLElBQUksR0FBRyxFQUFFO0lBQ3hDLE9BQU8sU0FBUyxJQUFJLEtBQUssSUFBQSwyQkFBYyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDNUQsQ0FBQztBQUZELG9CQUVDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFNBQVMsQ0FBNEIsR0FBVyxFQUFFLEtBQUssR0FBRyxLQUFLO0lBQzNFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxHQUFRLENBQUM7SUFDdEMsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTO1FBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUM5QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMs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