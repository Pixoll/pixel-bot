"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMessageToCommando = exports.yesOrNo = exports.fetchPartial = exports.emptyObject = exports.enumToObject = exports.omit = exports.pick = exports.deepCopy = exports.applyDefaults = exports.confirmButtons = exports.generateEmbed = exports.pagedEmbed = exports.docId = exports.isValidRole = exports.validateURL = exports.difference = exports.compareArrays = exports.arrayEquals = exports.sliceDots = exports.pluralize = exports.getKeyPerms = exports.isModerator = exports.inviteButton = exports.memberException = exports.userException = exports.getArgument = exports.basicCollector = exports.replyAll = exports.timestamp = exports.basicEmbed = exports.customEmoji = exports.isGuildModuleEnabled = exports.removeDashes = exports.addDashes = exports.code = exports.abcOrder = exports.sleep = void 0;
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
            name: `${emojiString} ${fieldName}`,
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
 * Replies to the corresponding instances
 * @param instances The instances to reply
 * @param options The options of the message
 */
async function replyAll(instances, options) {
    const instance = pixoll_commando_1.Util.getInstanceFrom(instances);
    if (options instanceof discord_js_1.EmbedBuilder)
        options = { embeds: [options] };
    if (typeof options === 'string')
        options = { content: options };
    if (instance instanceof pixoll_commando_1.CommandoInteraction) {
        if (instance.deferred || instance.replied) {
            return await instance.editReply(options).catch(() => null);
        }
        return await instance.reply(options).catch(() => null);
    }
    if (instance) {
        return await instance.reply({ ...options, ...pixoll_commando_1.Util.noReplyPingInDMs(instance) }).catch(() => null);
    }
    return null;
}
exports.replyAll = replyAll;
/**
 * Creates a basic collector with the given parameters.
 * @param instances The instances the command is being run for
 * @param embedOptions The options for the response messages.
 * @param collectorOptions The collector's options.
 * @param shouldDelete Whether the prompt should be deleted after it gets a value or not.
 */
async function basicCollector(instances, embedOptions, collectorOptions = {}, shouldDelete) {
    const instance = pixoll_commando_1.Util.getInstanceFrom(instances);
    const { author, channelId, client } = instance;
    collectorOptions.time ??= 30 * 1000;
    collectorOptions.max ??= 1;
    collectorOptions.filter ??= (m) => m.author.id === author.id;
    embedOptions.color ??= 'Blue';
    embedOptions.fieldValue ??= 'Respond with `cancel` to cancel the command.';
    embedOptions.footer ??= `The command will automatically be cancelled in ${(0, better_ms_1.prettyMs)(collectorOptions.time, {
        verbose: true,
        unitCount: 1,
    })}`;
    const toDelete = await replyAll(instances, basicEmbed(embedOptions));
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        throw new Error(`Unknown channel ${channelId}`);
    }
    const messages = await channel.awaitMessages(collectorOptions);
    if (instance instanceof pixoll_commando_1.CommandoMessage && shouldDelete)
        await toDelete?.delete().catch(() => null);
    if (messages.size === 0) {
        await replyAll(instances, { content: 'You didn\'t answer in time.', embeds: [] });
        return null;
    }
    if (messages.first()?.content.toLowerCase() === 'cancel') {
        await replyAll(instances, { content: 'Cancelled command.', embeds: [] });
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
    const initialValue = arg.required;
    arg.required = true;
    const response = await arg.obtain(message, '');
    arg.required = initialValue;
    if (response.cancelled)
        await message.reply({ content: 'Cancelled command.', ...pixoll_commando_1.Util.noReplyPingInDMs(message) });
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
 * @param msg The message instance
 * @param role The role to validate
 */
function isValidRole(msg, role) {
    if (!(role instanceof discord_js_1.Role) || !role || role.managed)
        return false;
    const { member, client, author, guild } = msg;
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
 * @param instances The instances for this embed
 * @param options Options for the paged embed.
 * @param template The embed template to use.
 */
async function pagedEmbed(instances, options, template) {
    const instance = pixoll_commando_1.Util.getInstanceFrom(instances);
    const { channelId, id, author, client } = instance;
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
        await replyAll(instances, (0, common_tags_1.stripIndent) `
            ${options.dmMsg || ''}
            **Didn\'t get the DM?** Then please allow DMs from server members.
        `);
    }
    if (instance instanceof pixoll_commando_1.CommandoMessage) {
        await targetChannel.sendTyping().catch(() => null);
    }
    const first = await template(0);
    const msgOptions = {
        embeds: [first.embed],
        components: pixoll_commando_1.Util.filterNullishItems([...options.components, buttons]),
    };
    const msg = options.toUser && !isDMs
        ? await targetChannel.send(msgOptions).catch(() => null)
        : await replyAll(instances, msgOptions);
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
            replyAll(instances, { components: [] }).catch(() => null);
    });
}
exports.pagedEmbed = pagedEmbed;
/**
 * Generates a paged embed based off the `array` and `embedOptions`
 * @param instances The instances for this embed
 * @param array The array that contains the data to be displayed
 * @param options Some extra data for the embed
 */
async function generateEmbed(instances, array, options) {
    const instance = pixoll_commando_1.Util.getInstanceFrom(instances);
    const { channels } = instance.client;
    const { number, color, authorName, authorIconURL, useDescription, title, inline, toUser, dmMsg, hasObjects, keyTitle, keys, keysExclude, useDocId, components, embedTitle, skipMaxButtons, numbered, } = applyDefaults(constants_1.defaultGenerateEmbedOptions, options);
    if (array.length === 0)
        throw new Error('array cannot be empty');
    keysExclude.push(...pixoll_commando_1.Util.filterNullishItems([
        keyTitle.prefix, keyTitle.suffix, '_id', '__v',
    ]));
    const objFilter = (key) => {
        return (keys ? keys.includes(key) : !!key) && !keysExclude.includes(key);
    };
    await pagedEmbed(instances, {
        number,
        total: array.length,
        toUser,
        dmMsg,
        components,
        skipMaxButtons,
    }, async (start, filter) => {
        const data = (!filter || filter === 'all') ? array
            : array.filter(doc => typeof doc === 'object' && doc.type === filter);
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
                iconURL: authorIconURL,
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
                ? Object.keys(isObject ? item._doc : item).filter(objFilter)
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
 * @param instances The instances for these buttons
 * @param options The button options
 */
async function confirmButtons(instances, options) {
    const instance = pixoll_commando_1.Util.getInstanceFrom(instances);
    const { id, author } = instance;
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
    const msg = await replyAll(instances, {
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
    if (instance instanceof pixoll_commando_1.CommandoMessage)
        await msg?.delete();
    await replyAll(instances, { components: [] });
    if (!pushed || pushed.customId === ids.no) {
        if (sendCancelled) {
            await replyAll(instances, {
                content: 'Cancelled command.', embeds: [],
            });
        }
        return false;
    }
    if (instance instanceof pixoll_commando_1.CommandoMessage) {
        await instance.channel.sendTyping().catch(() => null);
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
function pick(object, keys) {
    return omitOrPick('pick', object, keys);
}
exports.pick = pick;
function omit(object, keys) {
    return omitOrPick('omit', object, keys);
}
exports.omit = omit;
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
function omitOrPick(kind, object, keys) {
    const finalObject = {};
    const validEntires = Object.entries(object)
        .filter(([k]) => kind === 'omit' ? !keys.includes(k) : keys.includes(k));
    for (const [key, value] of validEntires) {
        finalObject[key] = value;
    }
    return finalObject;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FrQm9CO0FBQ3BCLHFEQWV5QjtBQUN6QixtQ0FBa0U7QUFDbEUsNkNBQTBDO0FBQzFDLHlDQUFxQztBQUVyQywyQ0FBb0c7QUFpTHBHLFlBQVk7QUFFWjs7O0dBR0c7QUFDSCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRkQsc0JBRUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLENBQVMsRUFBRSxDQUFTO0lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwQixPQUFPLENBQUMsQ0FBQztBQUNiLENBQUM7QUFKRCw0QkFJQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixJQUFJLENBQUMsSUFBWSxFQUFFLElBQUksR0FBRyxFQUFFO0lBQ3hDLE9BQU8sU0FBUyxJQUFJLEtBQUssSUFBQSwyQkFBYyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDNUQsQ0FBQztBQUZELG9CQUVDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFNBQVMsQ0FBNEIsR0FBVyxFQUFFLEtBQUssR0FBRyxLQUFLO0lBQzNFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxHQUFRLENBQUM7SUFDdEMsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTO1FBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUM5QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMs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