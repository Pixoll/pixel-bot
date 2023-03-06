"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgDate = exports.hyperlink = exports.parseArgInput = exports.validateArgInput = exports.addOrdinalSuffix = exports.arrayWithLength = exports.removeRepeated = exports.isTrue = exports.getSubCommand = exports.parseMessageToCommando = exports.yesOrNo = exports.fetchPartial = exports.emptyObject = exports.enumToObject = exports.deepCopy = exports.applyDefaults = exports.confirmButtons = exports.generateEmbed = exports.pagedEmbed = exports.generateDocId = exports.isValidRole = exports.validateURL = exports.difference = exports.compareArrays = exports.arrayEquals = exports.sliceDots = exports.pluralize = exports.getKeyPerms = exports.isModerator = exports.inviteButton = exports.memberException = exports.userException = exports.getArgument = exports.basicCollector = exports.replyAll = exports.timestamp = exports.basicEmbed = exports.customEmoji = exports.isGuildModuleEnabled = exports.removeDashes = exports.addDashes = exports.code = exports.abcOrder = exports.sleep = void 0;
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
    if (pixoll_commando_1.Util.isNullish(time))
        return null;
    let parsedTime = time;
    if (parsedTime instanceof Date)
        parsedTime = parsedTime.getTime();
    const chosenFormat = format ?? 'f';
    const trunc = Math.trunc(parsedTime / 1000);
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
    if (options.replyToEdit)
        return await options.replyToEdit.edit(messageOptions).catch(() => null);
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
    if (!member || !moderator)
        return null;
    const { client, name } = command;
    const options = {
        color: 'Red',
        emoji: 'cross',
        description: '',
    };
    if (!member.bannable || !member.kickable) {
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
    if (!message || !message.inGuild() || !(role instanceof discord_js_1.Role) || !role || role.managed)
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
const generator = (function* (n) {
    while (true)
        yield n++;
})(0);
/**
 * 16 characters-long hex id
 */
function generateDocId() {
    const iteration = generator.next().value.toString(16).padStart(5, '0');
    const timestamp = BigInt(Date.now()).toString(16);
    return timestamp + iteration;
}
exports.generateDocId = generateDocId;
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
/**
 * Array with items from `1` ➜ `length`
 */
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