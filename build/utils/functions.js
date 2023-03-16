"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.djsLocaleToBing = exports.parseArgDate = exports.hyperlink = exports.parseArgInput = exports.validateArgInput = exports.addOrdinalSuffix = exports.arrayWithLength = exports.removeRepeated = exports.isTrue = exports.getSubCommand = exports.parseMessageToCommando = exports.yesOrNo = exports.fetchPartial = exports.emptyObject = exports.enumToObject = exports.deepCopy = exports.applyDefaults = exports.confirmButtons = exports.generateEmbed = exports.pagedEmbed = exports.generateDocId = exports.isValidRole = exports.validateURL = exports.difference = exports.compareArrays = exports.arrayEquals = exports.limitStringLength = exports.pluralize = exports.getKeyPerms = exports.isModerator = exports.inviteButton = exports.memberException = exports.userException = exports.basicCollector = exports.replyAll = exports.timestamp = exports.basicEmbed = exports.customEmoji = exports.isGuildModuleEnabled = exports.removeDashes = exports.addDashes = exports.code = exports.abcOrder = exports.sleep = void 0;
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
 * @param language The language to use for this block
 */
function code(text, language) {
    return `\`\`\`${language ?? ''}\n${(0, discord_js_1.escapeCodeBlock)(text)}\n\`\`\``;
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
    const { color = constants_1.pixelColor, description, emoji, fieldName, fieldValue, footer } = options;
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
    if (!('isInteraction' in context) || context.isInteraction()) {
        if (context.deferred || context.replied) {
            return await context.editReply(pixoll_commando_1.Util.omit(options, ['ephemeral'])).catch(() => null);
        }
        if (context.isContextMenuCommand())
            options.ephemeral = true;
        return await context.reply({ ...options, fetchReply: true }).catch(() => null);
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
 * Adds three dots `...` if the length of the string is greater than `maxLength`, setting the string's length to that
 * @param string The string to limit
 * @param maxLength The max- length of the string
 */
function limitStringLength(string, maxLength) {
    if (string.length <= maxLength)
        return string;
    if (!string.startsWith('```') || !string.endsWith('```'))
        return string.substring(0, maxLength - 3) + '...';
    const lang = string.match(/\n?```(\w+)?\n?/)?.[1] ?? '';
    const codeString = string.replace(/\n?```(\w+)?\n?/g, '');
    const extraLength = string.length - codeString.length;
    const with3dots = codeString.substring(0, maxLength - 3 - extraLength) + '...';
    return code(with3dots, lang);
}
exports.limitStringLength = limitStringLength;
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
    const { channelId, id, client } = context;
    const author = 'author' in context ? context.author : context.user;
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
    if ('isMessage' in context && context.isMessage()) {
        await targetChannel.sendTyping().catch(() => null);
    }
    const first = await template(0);
    const msgOptions = {
        embeds: [first.embed],
        components: pixoll_commando_1.Util.filterNullishItems([...options.components, buttons]),
    };
    const msg = options.toUser && !isDMs
        ? await targetChannel.send(msgOptions).catch(() => null)
        : await replyAll(context, {
            ...msgOptions,
            ephemeral: options.ephemeral,
        });
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
        await replyAll(context, {
            components: [],
            replyToEdit: msg,
        });
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
    const { number, color, authorName, authorIconURL, useDescription, title, inline, toUser, dmMsg, hasObjects, keyTitle, keys, keysExclude, useDocId, components, embedTitle, skipMaxButtons, numbered, ephemeral, } = applyDefaults(constants_1.defaultGenerateEmbedOptions, options);
    if (array.length === 0)
        throw new Error('array cannot be empty');
    keysExclude.push(...pixoll_commando_1.Util.filterNullishItems([
        keyTitle.prefix, keyTitle.suffix, '_id', '__v',
    ]));
    const objFilter = (key) => {
        return (keys ? keys.includes(key) : !!key) && !keysExclude.includes(key);
    };
    await pagedEmbed(context, {
        ephemeral,
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
function djsLocaleToBing(locale) {
    const lang = locale;
    if (pixoll_commando_1.Util.equals(lang, ['en-GB', 'en-US']))
        return 'en';
    if (lang === 'zh-CN')
        return 'zh-Hans';
    if (lang === 'zh-TW')
        return 'zh-Hant';
    if (lang === 'no')
        return 'nb';
    if (lang === 'pt-BR')
        return 'pt';
    if (lang === 'es-ES')
        return 'es';
    if (lang === 'sv-SE')
        return 'sv';
    return lang;
}
exports.djsLocaleToBing = djsLocaleToBing;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FvQm9CO0FBQ3BCLHFEQWlCeUI7QUFDekIsbUNBQWtFO0FBQ2xFLDZDQUEwQztBQUMxQyx5Q0FBcUM7QUFFckMsMkNBTXFCO0FBaU1yQixZQUFZO0FBRVo7OztHQUdHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLENBQVM7SUFDM0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUZELHNCQUVDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFFBQVEsQ0FBQyxDQUFTLEVBQUUsQ0FBUztJQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEIsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDO0FBSkQsNEJBSUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsSUFBSSxDQUEwQyxJQUFPLEVBQUUsUUFBWTtJQUMvRSxPQUFPLFNBQVMsUUFBUSxJQUFJLEVBQUUsS0FBSyxJQUFBLDRCQUFlLEVBQUMsSUFBSSxDQUFDLFVBQXdDLENBQUM7QUFDckcsQ0FBQztBQUZELG9CQUVDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFNBQVMsQ0FBNEIsR0FBVyxFQUFFLEtBQUssR0FBRyxLQUFLO0lBQzNFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxHQUFRLENBQUM7SUFDdEMsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTO1FBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUM5QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENB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