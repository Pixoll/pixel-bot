"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInteger = exports.log = exports.rgb = exports.getContextMessage = exports.mergeRegexps = exports.djsLocaleToBing = exports.parseArgDate = exports.hyperlink = exports.parseArgInput = exports.validateArgInput = exports.addOrdinalSuffix = exports.arrayWithLength = exports.removeRepeated = exports.isTrue = exports.getSubCommand = exports.parseMessageToCommando = exports.yesOrNo = exports.fetchPartial = exports.emptyObject = exports.enumToObject = exports.deepCopy = exports.applyDefaults = exports.confirmButtons = exports.generateEmbed = exports.pagedEmbed = exports.generateDocId = exports.isValidRole = exports.validateURL = exports.difference = exports.compareArrays = exports.arrayEquals = exports.limitStringLength = exports.pluralize = exports.getKeyPerms = exports.isModerator = exports.inviteButton = exports.memberException = exports.userException = exports.basicCollector = exports.reply = exports.timestamp = exports.basicEmbed = exports.customEmoji = exports.isGuildModuleEnabled = exports.camelToKebabCase = exports.codeBlock = exports.alphabeticalOrder = exports.sleep = void 0;
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
 * Turns camelCase to kebab-case
 * @param string The string to parse
 */
function camelToKebabCase(string) {
    if (string.length === 0)
        return string;
    return string.replace(/[A-Z]/g, '-$&').toLowerCase();
}
exports.camelToKebabCase = camelToKebabCase;
async function isGuildModuleEnabled(guild, module, subModule) {
    const data = await guild.database.modules.fetch();
    if (!data)
        return false;
    const moduleName = pixoll_commando_1.Util.kebabToCamelCase(module);
    const subModuleName = subModule ? pixoll_commando_1.Util.kebabToCamelCase(subModule) : null;
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
        result[resultKey] = (0, lodash_1.isObject)(value) && (0, lodash_1.isObject)(first[key])
            ? difference(value, first[key])
            : value;
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
                ? pixoll_commando_1.Util.capitalize(item[keyTitle?.prefix])
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
                const propName = pixoll_commando_1.Util.capitalize(key
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
    const parsedMessage = message.client.dispatcher['parseMessage'](commandoMessage);
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
function log(messages, devEnv = true) {
    if (!devEnv) {
        const plainMessages = Array.isArray(messages) ? messages.map(message => typeof message === 'string' ? message : message.message) : [typeof messages === 'string' ? messages : messages.message];
        console.log(...plainMessages);
        return;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FvQm9CO0FBQ3BCLHFEQWV5QjtBQUN6QixtQ0FBc0Q7QUFDdEQsNkNBQTBDO0FBQzFDLHlDQUFxQztBQUVyQywyQ0FRcUI7QUErTnJCLFlBQVk7QUFFWjs7O0dBR0c7QUFDSCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRkQsc0JBRUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQzdCLE9BQXNDO0lBRXRDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDN0MsU0FBUyxFQUFFLElBQUk7S0FDbEIsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFzQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsTUFBTSxDQUFDLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU87WUFDMUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7WUFDaEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekQsTUFBTSxDQUFDLEdBQUcsT0FBTyxNQUFNLEtBQUssUUFB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