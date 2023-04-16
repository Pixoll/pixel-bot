"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInteger = exports.log = exports.rgb = exports.getContextMessage = exports.mergeRegexps = exports.djsLocaleToBing = exports.parseArgDate = exports.hyperlink = exports.parseArgInput = exports.validateArgInput = exports.addOrdinalSuffix = exports.arrayWithLength = exports.removeRepeated = exports.isTrue = exports.getSubCommand = exports.parseMessageToCommando = exports.yesOrNo = exports.fetchPartial = exports.emptyObject = exports.enumToObject = exports.deepCopy = exports.applyDefaults = exports.confirmButtons = exports.generateEmbed = exports.pagedEmbed = exports.generateDocId = exports.isValidRole = exports.validateURL = exports.difference = exports.compareArrays = exports.arrayEquals = exports.limitStringLength = exports.pluralize = exports.getKeyPerms = exports.isModerator = exports.inviteButton = exports.memberException = exports.userException = exports.basicCollector = exports.reply = exports.timestamp = exports.basicEmbed = exports.customEmoji = exports.isGuildModuleEnabled = exports.removeDashes = exports.addDashes = exports.codeBlock = exports.alphabeticalOrder = exports.sleep = void 0;
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
function alphabeticalOrder(options) {
    const { forceCase, sortKey } = Object.assign({}, {
        forceCase: true,
    }, options ?? {});
    return (first, second) => {
        if (typeof first === 'object' && !sortKey) {
            throw new Error('Detected object type in sorter. You must specify a sorting key.');
        }
        const a = typeof first === 'object' && sortKey
            ? first[sortKey]
            : forceCase ? first.toString().toLowerCase() : first;
        const b = typeof second === 'object' && sortKey
            ? second[sortKey]
            : forceCase ? second.toString().toLowerCase() : second;
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    };
}
exports.alphabeticalOrder = alphabeticalOrder;
/**
 * Parses a string to have code block style
 * @param text The string to parse
 * @param language The language to use for this block
 */
function codeBlock(text, language) {
    return `\`\`\`${language ?? ''}\n${(0, discord_js_1.escapeCodeBlock)(text)}\n\`\`\``;
}
exports.codeBlock = codeBlock;
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
async function reply(context, options) {
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
exports.reply = reply;
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
    const toDelete = await reply(context, basicEmbed(embedOptions));
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        throw new Error(`Unknown channel ${channelId}`);
    }
    const messages = await channel.awaitMessages(collectorOptions);
    if (context.isMessage() && shouldDelete)
        await toDelete?.delete().catch(() => null);
    if (messages.size === 0) {
        await reply(context, { content: 'You didn\'t answer in time.', embeds: [] });
        return null;
    }
    if (messages.first()?.content.toLowerCase() === 'cancel') {
        await reply(context, { content: 'Cancelled command.', embeds: [] });
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
    if (!member.bannable || !member.kickable || !member.moderatable) {
        options.fieldName = `Unable to ${name} ${member.user.tag}`;
        options.fieldValue = 'Please check the role hierarchy or server ownership.';
        return options;
    }
    if (client.isOwner(moderator.id))
        return null;
    const highestTarget = member.roles.highest;
    const highestMod = moderator.roles.highest;
    const bannable = highestMod.comparePositionTo(highestTarget) > 0;
    if (!bannable || client.isOwner(member.id)) {
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
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
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
    if (!noAdmin && permissions.has('Administrator'))
        return true;
    const metConditions = constants_1.moderatorPermissions.map(condition => permissions.has(condition));
    const hasTrue = metConditions.some(b => b === true);
    if (!noAdmin)
        return hasTrue;
    return !permissions.has('Administrator') && hasTrue;
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
    return codeBlock(with3dots, lang);
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
    const botManageable = guild.members.me?.roles.highest.comparePositionTo(role.id);
    if (pixoll_commando_1.Util.isNullish(botManageable) || botManageable < 1)
        return false;
    const isOwner = author.id === botId;
    if (isOwner)
        return true;
    const memberManageable = member?.roles.highest.comparePositionTo(role.id);
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
        await reply(context, (0, common_tags_1.stripIndent) `
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
        : await reply(context, {
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
        await reply(context, {
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
        throw new Error('Array cannot be empty');
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
            const values = [];
            for (const key of objKeys) {
                const objectItem = item;
                if (objKeys.length === 1) {
                    values.push(objectItem[key]);
                    break;
                }
                const propName = (0, lodash_1.capitalize)(key
                    .replace(/^createdAt$/, 'date')
                    .replace(/Id$/, '')
                    .replace(/[A-Z]/g, ' $&')).trim();
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
                values.push(`**${propName}:** ${docData}`);
            }
            embed.addFields({
                name: `${numberPrefix} ${prefix} ${title} ${suffix}`.replace(/ +/g, ' '),
                value: `${values.length !== 0 ? values.join('\n') : item}`,
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
    const msg = await reply(context, {
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
    await reply(context, { components: [] });
    if (!pushed || pushed.customId === ids.no) {
        if (sendCancelled) {
            await reply(context, {
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
async function parseArgDate(context, command, argumentIndex, value, defaultValue, fallbackValue) {
    if (context.isMessage() || pixoll_commando_1.Util.isNullish(value))
        return value;
    const message = await context.fetchReply();
    const argument = command.argsCollector?.args[argumentIndex];
    const type = argument?.type?.id.split('|')[0];
    const resultDate = await argument?.parse(value?.toString() ?? defaultValue ?? '', message).catch(() => null);
    if (pixoll_commando_1.Util.isNullish(resultDate) && pixoll_commando_1.Util.isNullish(fallbackValue)) {
        await reply(context, basicEmbed({
            color: 'Red',
            emoji: 'cross',
            description: `The ${type} you specified is invalid.`,
        }));
        return null;
    }
    return resultDate ?? fallbackValue;
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
function mergeRegexps(flags, ...regexps) {
    const merged = regexps.map(regex => typeof regex === 'string' ? `(?:${regex})` : `(?:${regex.source})`).join('|');
    if (flags.length === 0)
        return new RegExp(merged);
    return new RegExp(merged, flags.join(''));
}
exports.mergeRegexps = mergeRegexps;
async function getContextMessage(context) {
    return 'isMessage' in context && context.isMessage()
        ? context
        : await context.fetchReply();
}
exports.getContextMessage = getContextMessage;
function rgb(r, g, b) {
    return `\x1b[38;2;${r ?? 0};${g ?? 0};${b ?? 0}m`;
}
exports.rgb = rgb;
function log(messages, timestamp = true) {
    if (!timestamp)
        return console.log(...resolveLogMessages(messages));
    const now = new Date();
    const time = now.toLocaleTimeString();
    const ms = now.getTime().toString().slice(-3);
    console.log(resolveLogMessages({
        message: `[${time}.${ms}]:`,
        styles: ['Aqua'],
    }), resolveLogMessages(messages));
}
exports.log = log;
function isInteger(n) {
    return Number(n) === n && n % 1 === 0;
}
exports.isInteger = isInteger;
function resolveLogMessages(messages, single) {
    if (!Array.isArray(messages))
        messages = [messages];
    const parsedMessages = messages.map(message => {
        if (typeof message === 'string')
            return message;
        const { styles } = message;
        if (!styles || styles.length === 0)
            return message.message;
        const parsedStyles = parseLogStyles(styles);
        return parsedStyles + message.message + constants_1.LogStyles.Reset;
    });
    return (single === false
        ? parsedMessages
        : parsedMessages.join(' '));
}
function parseLogStyles(styles) {
    return styles.map(style => {
        if (typeof style === 'string')
            return constants_1.LogStyles[style];
        const [r, g, b] = style.slice(0, 3);
        if (!isInteger(r) || !isInteger(g) || !isInteger(b)) {
            throw new RangeError('RGB parameters must be integers.');
        }
        return rgb(r, g, b);
    }).join('');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FvQm9CO0FBQ3BCLHFEQWV5QjtBQUN6QixtQ0FBa0U7QUFDbEUsNkNBQTBDO0FBQzFDLHlDQUFxQztBQUVyQywyQ0FRcUI7QUEwTnJCLFlBQVk7QUFFWjs7O0dBR0c7QUFDSCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRkQsc0JBRUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQzdCLE9BQXNDO0lBRXRDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDN0MsU0FBUyxFQUFFLElBQUk7S0FDbEIsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFzQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsTUFBTSxDQUFDLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU87WUFDMUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7WUFDaEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekQsTUFBTSxDQUFDLEdBQUcsT0FBTyxNQUFNLEtBQUssUUFB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