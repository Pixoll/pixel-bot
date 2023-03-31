import {
    AwaitMessagesOptions,
    ColorResolvable,
    GuildMember,
    Invite,
    Message,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    MessageCreateOptions,
    StringSelectMenuBuilder,
    Role,
    User,
    escapeCodeBlock,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    ComponentType,
    If,
    Locale,
    LocaleString,
} from 'discord.js';
import {
    Argument,
    ArgumentTypeString,
    ArgumentTypeStringMap,
    Command,
    CommandContext,
    CommandContextChannel,
    CommandoUserContextMenuCommandInteraction,
    CommandoGuild,
    CommandoGuildMember,
    CommandoifiedMessage,
    CommandoMessage,
    CommandoRole,
    GuildAuditLog,
    GuildModule,
    Util,
    CommandoMessageContextMenuCommandInteraction,
} from 'pixoll-commando';
import { transform, isEqual, isObject, capitalize } from 'lodash';
import { stripIndent } from 'common-tags';
import { prettyMs } from 'better-ms';
import { AnyMessage, RawModuleName } from '../types';
import {
    BingLanguageId,
    defaultGenerateEmbedOptions,
    moderatorPermissions,
    pixelColor,
    validateUrlPattern,
} from './constants';

//#region Types

/** A custom emoji name */
export type CustomEmoji =
    | 'boost'
    | 'bot'
    | 'check'
    | 'cross'
    | 'dnd'
    | 'idle'
    | 'info'
    | 'invis'
    | 'loading'
    | 'neutral'
    | 'online'
    | `\\${string}`;

export interface BasicEmbedOptions {
    /** The description of the embed. */
    description?: string;
    /**
     * The color of the embed.
     * @default '#4c9f4c'
     */
    color?: Exclude<ColorResolvable, number>;
    /** The emoji to use with the text or field name. */
    emoji?: CustomEmoji;
    /** The name of the field. */
    fieldName?: string;
    /** The value of the field. Only usable if `fieldName` is specified. */
    fieldValue?: string;
    /** The footer of the field. */
    footer?: string;
}

export type TemplateEmbedFunction = (start: number, filter?: string) => Awaitable<TemplateEmbedResult>;

export interface TemplateEmbedResult {
    embed: EmbedBuilder;
    total: number;
}

export interface PagedEmbedOptions {
    /** Whether the paged embed will be ephemeral */
    ephemeral?: boolean;
    /** The number of chunks of data to be displayed in one page. */
    number: number;
    /** The total chunks of data. */
    total: number;
    /**
     * Whether to send the embed to the user DMs or not.
     * @default false
     */
    toUser?: boolean;
    /**
     * Whether to send the embed to the user DMs or not.
     * @default ''
     */
    dmMsg?: string;
    /**
     * The components to attach to the message
     * @default []
     */
    components?: Array<ActionRowBuilder<MessageActionRowComponentBuilder>>;
    /**
     * Whether to skip the page start and page end buttons
     * @default false
     */
    skipMaxButtons?: boolean;
}

export interface GenerateEmbedOptions<T extends object | string> {
    /**
     * Whether the generated embed will be ephemeral
     * @default false
     */
    ephemeral?: boolean;
    /**
     * The number of chunks to display per page
     * @default 6
     */
    number?: number;
    /**
     * The color of the embed
     * @default '#4c9f4c'
     */
    color?: ColorResolvable;
    /** The title of the embed */
    embedTitle?: string;
    /** The name of the author */
    authorName?: string;
    /** The icon URL of the author */
    authorIconURL?: string | null;
    /**
     * The title of each section in the embed
     * @default ''
     */
    title?: string;
    /**
     * Whether to use `setDescription()` or not
     * @default false
     */
    useDescription?: boolean;
    /**
     * The components to attach to the message
     * @default []
     */
    components?: Array<ActionRowBuilder<MessageActionRowComponentBuilder>>;
    /**
     * Whether the data should be displayed inline in the embed
     * @default false
     */
    inline?: boolean;
    /**
     * Whether to send the embed to the user DMs or not
     * @default false
     */
    toUser?: boolean;
    /**
     * The message to send to the user in DMs. Only if `toUser` is true
     * @default ''
     */
    dmMsg?: string;
    /**
     * Whether to skip the page start and page end buttons
     * @default false
     */
    skipMaxButtons?: boolean;
    /**
     * Whether `array` contains objects inside or not
     * @default true
     */
    hasObjects?: boolean;
    /**
     * Whether to number the items or not
     * @default false
     */
    numbered?: boolean;
    /**
     * A custom key data to use from the nested objects on the title
     * @default {}
     */
    keyTitle?: {
        /** The name of the key to use as a prefix */
        prefix?: T extends string ? string : keyof T;
        /** The name of the key to use as a suffix */
        suffix?: T extends string ? string : keyof T;
    };
    /** The properties to display in the embed. If empty I will use every property */
    keys?: Array<(T extends string ? string : keyof T) | null>;
    /**
     * The properties to exclude on the embed. If empty I will use `data.keys` or every property
     * @default []
     */
    keysExclude?: Array<(T extends string ? string : keyof T) | null>;
    /**
     * Whether to use the document's ID on each data chunk
     * @default false
     */
    useDocId?: boolean;
}

export interface ConfirmButtonsOptions {
    /** The action to confirm */
    action: string;
    /** The target on which this action is being executed */
    target?: CommandoGuild | User | string;
    /** The reason of this action */
    reason?: string;
    /** The duration of this action */
    duration?: string;
    /**
     * Whether to send 'Cancelled command.' or not
     * @default true
     */
    sendCancelled?: boolean;
}

export interface AnyPartial {
    partial: boolean;
    fetch(): Promise<AnyPartial>;
}

export type ReplyAllOptions =
    | EmbedBuilder
    | string
    | Omit<MessageCreateOptions, 'flags'> & {
        ephemeral?: boolean;
        replyToEdit?: AnyMessage | null;
    };

//#endregion

/**
 * Pauses the command's execution
 * @param s Amount of seconds
 */
export function sleep(s: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

/**
 * Orders an array in alphabetical order
 * @param a The first string
 * @param b The seconds string
 */
export function abcOrder(a: string, b: string): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

/**
 * Parses a string to have code block style
 * @param text The string to parse
 * @param language The language to use for this block
 */
export function codeBlock<C extends string, L extends string = ''>(text: C, language?: L): `\`\`\`${L}\n${C}\n\`\`\`` {
    return `\`\`\`${language ?? ''}\n${escapeCodeBlock(text)}\n\`\`\`` as `\`\`\`${L}\n${C}\n\`\`\``;
}

/**
 * Adds dashes to the string on every upper case letter
 * @param str The string to parse
 * @param under Wether to use underscores instead or not
 */
export function addDashes<T extends string = string>(str: string, under = false): T {
    if (str.length === 0) return str as T;
    if (typeof under !== 'boolean') under = false;
    return str.replace(/[A-Z]/g, under ? '_$&' : '-$&').toLowerCase() as T;
}

/**
 * Removes dashes from the string and capitalizes the remaining strings
 * @param str The string to parse
 */
export function removeDashes<T extends string = string>(str: string): T {
    if (str.length === 0) return str as T;
    const arr = str.split('-');
    const first = arr.shift();
    const rest = arr.map(capitalize).join('');
    return first + rest as T;
}

/**
 * Checks if a guild module is enabled
 * @param guild The guild to look into
 * @param module The module to check
 * @param subModule The sub-module to check
 */
export async function isGuildModuleEnabled<
    M extends GuildModule, S extends (M extends 'audit-logs' ? GuildAuditLog : never)
>(
    guild: CommandoGuild, module: M, subModule?: S
): Promise<boolean> {
    const data = await guild.database.modules.fetch();
    if (!data) return false;
    const moduleName = removeDashes<RawModuleName>(module);
    const subModuleName = subModule ? removeDashes<GuildAuditLog>(subModule) : null;

    const toCheck = moduleName === 'auditLogs' && subModuleName
        ? data[moduleName]?.[subModuleName]
        : data[moduleName];

    if (typeof toCheck === 'object') {
        const status: boolean[] = [];
        for (const prop of Object.keys(toCheck)) {
            if (typeof toCheck[prop] === 'function') continue;
            status.push(!!toCheck[prop]);
        }
        return !!status.filter(b => b)[0];
    }

    return !!toCheck;
}

/**
 * Returns a certain emoji depending on the specified string.
 * @param emoji The emoji you want to get.
 * @param animated If the emoji you want is animated.
 */
export function customEmoji(emoji?: CustomEmoji, animated = false): string {
    if (!emoji) return '';

    switch (emoji) {
        case 'boost': return '<a:boost:806364586231595028>';
        case 'bot': return '<:bot1:893998060965883904><:bot2:893998060718399528>';
        case 'check': {
            if (animated) return '<a:check:863118691808706580>';
            return '<:check:802617654396715029>';
        }
        case 'cross': {
            if (animated) return '<a:cross:863118691917889556>';
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

/**
 * Creates a basic custom embed.
 * @param options Options for the embed.
 */
export function basicEmbed(options: BasicEmbedOptions): EmbedBuilder {
    const { color = pixelColor, description, emoji, fieldName, fieldValue, footer } = options;

    if (!description && !fieldName) throw new Error('The argument description or fieldName must be specified');

    const emojiString = customEmoji(emoji);
    const embed = new EmbedBuilder()
        .setColor(color);

    if (description) embed.setDescription(`${emojiString} ${description}`);
    if (fieldName) {
        if (!fieldValue) throw new Error('The argument fieldValue must be specified');
        embed.addFields({
            name: description ? fieldName : `${emojiString} ${fieldName}`,
            value: fieldValue,
        });
    }
    if (footer) embed.setFooter({ text: footer });

    return embed;
}

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
export function timestamp<T extends Date | number | null, F extends TimestampType = 'f'>(
    time: T, format?: F, exact = false
): T extends null ? null : `<t:${number}:${F}>` {
    if (Util.isNullish(time)) return null as T extends null ? null : `<t:${number}:${F}>`;
    let parsedTime = time as Date | number;
    if (parsedTime instanceof Date) parsedTime = parsedTime.getTime();

    const chosenFormat = format ?? 'f';
    const trunc = Math.trunc(parsedTime / 1000);
    if (exact) return `<t:${trunc}:${chosenFormat}>` as T extends null ? null : `<t:${number}:${F}>`;

    const rem = trunc % 60;
    const epoch = trunc - rem;

    return `<t:${epoch}:${chosenFormat}>` as T extends null ? null : `<t:${number}:${F}>`;
}

/**
 * Replies to the corresponding context
 * @param context The command context to reply
 * @param options The options of the message
 */
export async function reply(
    context: CommandContext | CommandoMessageContextMenuCommandInteraction | CommandoUserContextMenuCommandInteraction,
    options: ReplyAllOptions
): Promise<Message | null> {
    if (options instanceof EmbedBuilder) options = { embeds: [options] };
    if (typeof options === 'string') options = { content: options };
    if (!('isInteraction' in context) || context.isInteraction()) {
        if (context.deferred || context.replied) {
            return await context.editReply(Util.omit(options, ['ephemeral'])).catch(() => null);
        }
        if (context.isContextMenuCommand()) options.ephemeral = true;
        return await context.reply({ ...options, fetchReply: true }).catch(() => null);
    }
    const messageOptions = {
        ...options,
        ...Util.noReplyPingInDMs(context),
    };
    if (options.replyToEdit) return await options.replyToEdit.edit(messageOptions).catch(() => null);
    return await context.reply(messageOptions).catch(() => null);
}

/**
 * Creates a basic collector with the given parameters.
 * @param context The command context
 * @param embedOptions The options for the response messages.
 * @param collectorOptions The collector's options.
 * @param shouldDelete Whether the prompt should be deleted after it gets a value or not.
 */
export async function basicCollector(
    context: CommandContext,
    embedOptions: BasicEmbedOptions,
    collectorOptions: AwaitMessagesOptions | null = {},
    shouldDelete?: boolean
): Promise<Message | null> {
    const { author, channelId, client } = context;

    collectorOptions ??= {};
    collectorOptions.time ??= 30 * 1000;
    collectorOptions.max ??= 1;
    collectorOptions.filter ??= (m): boolean => m.author.id === author.id;

    embedOptions.color ??= 'Blue';
    embedOptions.fieldValue ??= 'Respond with `cancel` to cancel the command.';
    embedOptions.footer ??= `The command will automatically be cancelled in ${prettyMs(collectorOptions.time, {
        verbose: true,
        unitCount: 1,
    })}`;

    const toDelete = await reply(context, basicEmbed(embedOptions));
    const channel = await client.channels.fetch(channelId).catch(() => null) as CommandContextChannel<true>;
    if (!channel) {
        throw new Error(`Unknown channel ${channelId}`);
    }

    const messages = await channel.awaitMessages(collectorOptions);
    if (context.isMessage() && shouldDelete) await toDelete?.delete().catch(() => null);

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

/**
 * Makes sure the moderation command is usable by the user
 * @param user The user targeted in the the command
 * @param author The user who ran the command
 * @param command The command that's being ran
 */
export function userException(user: User, author: User, command: Command): BasicEmbedOptions | null {
    const { client, name } = command;
    if (user.id !== client.user?.id && user.id !== author.id) return null;

    return {
        color: 'Red',
        emoji: 'cross',
        description: user.id === author.id
            ? `You can't ${name} yourself.`
            : `You can't make me ${name} myself.`,
    };
}

/**
 * Makes sure the moderation command is usable by the member
 * @param member The targeted member
 * @param moderator The member who ran the command
 * @param command The command that's being ran
 */
export function memberException(
    member: Nullable<GuildMember>, moderator: Nullable<GuildMember>, command: Command
): BasicEmbedOptions | null {
    if (!member || !moderator) return null;
    const { client, name } = command;

    const options: BasicEmbedOptions = {
        color: 'Red',
        emoji: 'cross',
        description: '',
    };
    if (!member.bannable || !member.kickable || !member.moderatable) {
        options.fieldName = `Unable to ${name} ${member.user.tag}`;
        options.fieldValue = 'Please check the role hierarchy or server ownership.';
        return options;
    }

    if (client.isOwner(moderator)) return null;

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

/**
 * Creates a {@link ActionRowBuilder} with a {@link ButtonBuilder} with the provided invite
 * @param invite The invite to user for the button
 * @param label The label of the button
 */
export function inviteButton(
    invite: Invite | string, label = 'Join back'
): ActionRowBuilder<MessageActionRowComponentBuilder> {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel(label)
                .setStyle(ButtonStyle.Link)
                .setURL(invite.toString())
        );
}

/**
 * Checks if the role or member is considered a moderator by checking their permissions.
 * @param roleOrMember A role or member.
 * @param noAdmin Whether to skip the `ADMINISTRATOR` permission or not.
 */
export function isModerator(roleOrMember?: GuildMember | Role | null, noAdmin?: boolean): boolean {
    if (!roleOrMember) return false;
    const { permissions } = roleOrMember;

    const values: boolean[] = [];
    if (noAdmin) {
        for (const condition of moderatorPermissions) {
            values.push(permissions.has(condition));
        }
        const isTrue = values.filter(b => b === true)[0] ?? false;
        return !permissions.has('Administrator') && isTrue;
    }

    if (permissions.has('Administrator')) return true;

    for (const condition of moderatorPermissions) {
        values.push(permissions.has(condition));
    }
    const isTrue = values.filter(b => b === true)[0] ?? false;
    return isTrue;
}

/**
 * Gets the mod permissions from a role or member.
 * @param roleOrMember A role or member.
 */
export function getKeyPerms(roleOrMember: CommandoGuildMember | CommandoRole | GuildMember | Role): string {
    const perms = roleOrMember.permissions;

    if (perms.has('Administrator')) return 'Administrator';

    const filtered = perms.toArray().filter(perm => moderatorPermissions.includes(perm));
    if (filtered.length === 0) return 'None';

    return filtered.map(perm => Util.permissions[perm]).join(', ');
}

/**
 * Pluralizes a string, adding `s` or `es` at the end of it
 * @param string The string to pluralize
 * @param number The number to check with
 * @param showNum If it should show the number
 */
export function pluralize(string: string, number: number, showNum = true): string {
    if (number === 1) {
        if (!showNum) return string;
        return `${number} ${string}`;
    }

    let es;
    for (const end of ['ch', 'sh', 's', 'x', 'z']) {
        if (string.endsWith(end)) es = true;
    }

    if (!showNum) return string + (es ? 'es' : 's');
    return `${number} ${string}${es ? 'es' : 's'}`;
}

/**
 * Adds three dots `...` if the length of the string is greater than `maxLength`, setting the string's length to that
 * @param string The string to limit
 * @param maxLength The max- length of the string
 */
export function limitStringLength(string: string, maxLength: number): string {
    if (string.length <= maxLength) return string;
    if (!string.startsWith('```') || !string.endsWith('```')) return string.substring(0, maxLength - 3) + '...';
    const lang = string.match(/\n?```(\w+)?\n?/)?.[1] ?? '';
    const codeString = string.replace(/\n?```(\w+)?\n?/g, '');
    const extraLength = string.length - codeString.length;
    const with3dots = codeString.substring(0, maxLength - 3 - extraLength) + '...';
    return codeBlock(with3dots, lang);
}

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
export function arrayEquals(first: unknown[], second: unknown[]): boolean {
    if (first.length !== second.length) return false;
    const uniqueValues = new Set([...first, ...second]);
    for (const value of uniqueValues) {
        const aCount = first.filter(e => e === value).length;
        const bCount = second.filter(e => e === value).length;
        if (aCount !== bCount) return false;
    }
    return true;
}

/**
 * Compares and returns the difference between a set of arrays
 * @param oldArr The old array
 * @param newArr The new array
 * @returns `[added, removed]`
 */
export function compareArrays<T>(oldArr: T[], newArr: T[]): [T[], T[]] {
    const map1 = new Map();
    oldArr.forEach(e => map1.set(e, true));
    const added = newArr.filter(e => !map1.has(e));

    const map2 = new Map();
    newArr.forEach(e => map2.set(e, true));
    const removed = oldArr.filter(e => !map2.has(e));

    return [added, removed];
}

/**
 * Compares if two objects are equal and returns the differences.
 * @param first The first object.
 * @param second The second object.
 */
export function difference<T extends unknown[] | object>(first: T, second: T): Partial<T> {
    let arrayIndexCounter = 0;
    return transform(second, (result, value, key) => {
        if (isEqual(value, first[key])) return;
        const resultKey = Array.isArray(first) ? arrayIndexCounter++ : key;
        // @ts-expect-error: from Stack Overflow, works
        result[resultKey] = isObject(value) && isObject(first[key]) ? difference(value, first[key]) : value;
    });
}

/** Checks whether the string is a valid URL.
 * @param str The string to verify.
 */
export function validateURL(str: string): boolean {
    if (!str.includes('.') || !str.includes('/')) return false;
    return validateUrlPattern.test(str);
}

/**
 * Validates a {@link Role} to be used in commands
 * @param message The message instance
 * @param role The role to validate
 */
export function isValidRole(message: AnyMessage | CommandContext | null, role?: Role | null): boolean {
    if (!message || !message.inGuild() || !(role instanceof Role) || !role || role.managed) return false;

    const { member, client, author, guild } = message;
    const botId = client.user.id;

    const botManageable = guild.members.me?.roles.highest.comparePositionTo(role);
    if (Util.isNullish(botManageable) || botManageable < 1) return false;

    const isOwner = author.id === botId;
    if (isOwner) return true;

    const memberManageable = member?.roles.highest.comparePositionTo(role);
    if (Util.isNullish(memberManageable) || memberManageable < 1) return false;
    if (isModerator(role)) return false;

    return true;
}

const generator = (function* (n: number): Generator<number, never, number> {
    while (true) yield n++;
})(0);

/**
 * 16 characters-long hex id
 */
export function generateDocId(): string {
    const iteration = generator.next().value.toString(16).padStart(5, '0');
    const timestamp = BigInt(Date.now()).toString(16);
    return timestamp + iteration;
}

/**
 * Creates a basic paged embed with the template provided.
 * @param context The command context
 * @param options Options for the paged embed.
 * @param template The embed template to use.
 */
export async function pagedEmbed(
    context: CommandContext | CommandoMessageContextMenuCommandInteraction | CommandoUserContextMenuCommandInteraction,
    options: PagedEmbedOptions,
    template: TemplateEmbedFunction
): Promise<void> {
    const { channelId, id, client } = context;
    const author = 'author' in context ? context.author : context.user;
    const channel = await client.channels.fetch(channelId).catch(() => null) as CommandContextChannel<true>;
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

    const pageStart = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(ids.start)
        .setEmoji('⏪')
        .setDisabled();
    const pageDown = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(ids.down)
        .setEmoji('⬅️')
        .setDisabled();
    const pageUp = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(ids.up)
        .setEmoji('➡️');
    const pageEnd = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(ids.end)
        .setEmoji('⏩');

    const buttons = options.total <= options.number ? null : new ActionRowBuilder<ButtonBuilder>()
        .addComponents(options.skipMaxButtons
            ? [pageDown, pageUp] : [pageStart, pageDown, pageUp, pageEnd]
        );

    if (options.toUser && !isDMs) {
        await reply(context, stripIndent`
            ${options.dmMsg || ''}
            **Didn\'t get the DM?** Then please allow DMs from server members.
        `);
    }

    if ('isMessage' in context && context.isMessage()) {
        await targetChannel.sendTyping().catch(() => null);
    }

    const first = await template(0);
    const msgOptions: MessageCreateOptions = {
        embeds: [first.embed],
        components: Util.filterNullishItems([...options.components, buttons]),
    };

    const msg = options.toUser && !isDMs
        ? await targetChannel.send(msgOptions).catch(() => null)
        : await reply(context, {
            ...msgOptions,
            ephemeral: options.ephemeral,
        });

    if (!msg || (options.total <= options.number && !options.components[0])) return;

    let index = 0;
    const collector = targetChannel.createMessageComponentCollector({
        async filter(int) {
            if (msg.id !== int.message?.id) return false;
            if (!int.isButton() && !int.isStringSelectMenu()) return false;
            if (int.user.id === author.id) return true;
            await int.reply({
                content: 'This interaction doesn\'t belong to you.', ephemeral: true,
            });
            return false;
        },
        time: 60 * 1000,
    });

    const disableButton = (target: string, disabled = true): void => {
        const button = buttons?.components.find(b => {
            const apiButton = b.toJSON();
            if (!('custom_id' in apiButton)) return false;
            return apiButton.custom_id.endsWith(target);
        });
        if (!button) return;
        button.setDisabled(disabled);
    };

    const menuOptions = options.components[0]?.components
        .filter<StringSelectMenuBuilder>((c): c is StringSelectMenuBuilder => c instanceof StringSelectMenuBuilder)
        .at(0)
        ?.options.map(op => op.data.value ?? '') ?? [];

    let option: string | undefined = 'all';

    collector.on('collect', async int => {
        if (int.isButton()) {
            const oldData = await template(index, option);
            if (typeof oldData.total !== 'number') oldData.total = options.total;

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
                components: Util.filterNullishItems([...(options.components ?? []), buttons]),
                ...Util.noReplyPingInDMs(msg),
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
                components: Util.filterNullishItems([...(options.components ?? []), buttons]),
                ...Util.noReplyPingInDMs(msg),
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

/**
 * Generates a paged embed based off the `array` and `embedOptions`
 * @param context The command context
 * @param array The array that contains the data to be displayed
 * @param options Some extra data for the embed
 */
export async function generateEmbed<T extends object | string>(
    context: CommandContext | CommandoMessageContextMenuCommandInteraction | CommandoUserContextMenuCommandInteraction,
    array: T[],
    options: GenerateEmbedOptions<T>
): Promise<void> {
    const { channels } = context.client;
    const {
        number, color, authorName, authorIconURL, useDescription, title, inline, toUser, dmMsg, hasObjects, keyTitle,
        keys, keysExclude, useDocId, components, embedTitle, skipMaxButtons, numbered, ephemeral,
    } = applyDefaults(defaultGenerateEmbedOptions, options);

    if (array.length === 0) throw new Error('Array cannot be empty');
    keysExclude.push(...Util.filterNullishItems([
        keyTitle.prefix, keyTitle.suffix, '_id', '__v',
    ]));

    const objFilter = (key: string): boolean => {
        return (keys ? keys.includes(key as T extends string ? string : keyof T) : !!key) && !keysExclude.includes(key);
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
            : array.filter(doc => typeof doc === 'object' && 'type' in doc && doc.type === filter)
        ) as Array<Record<string, unknown>>;

        const pages = Math.trunc(data.length / number) + ((data.length / number) % 1 === 0 ? 0 : 1);
        const current = data.slice(start, start + number);

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTimestamp();

        if (embedTitle) embed.setTitle(embedTitle);
        if (authorName) {
            embed.setAuthor({
                name: authorName,
                iconURL: authorIconURL ?? undefined,
            });
        }
        if (pages > 1) embed.setFooter({ text: `Page ${Math.round(start / number + 1)} of ${pages}` });
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
                ? Object.keys(isObject && '_doc' in item ? item._doc as object : item).filter(objFilter)
                : [];

            const docId = useDocId && isObject
                ? (typeof item._doc === 'object' && item._doc
                    ? (item._doc as Dictionary<string>)?._id
                    : item._id
                ) as string
                : null;
            const numberPrefix = numbered ? `${start + index + 1}.` : '';
            const prefix = isObject && keyTitle?.prefix
                ? capitalize(item[keyTitle?.prefix] as string)
                : '';
            const suffix = docId || (!keyTitle?.suffix || !isObject ? start + index + 1
                : ((item[keyTitle?.suffix] && typeof item[keyTitle?.suffix] !== 'string'
                    ? timestamp((item[keyTitle?.suffix] as number) / 1)
                    : null
                ) || item[keyTitle?.suffix]
                ));

            const values: string[] = [];
            for (const key of objKeys) {
                const objectItem = item as Record<string, unknown>;
                if (objKeys.length === 1) {
                    values.push(objectItem[key] as string);
                    break;
                }

                const propName = capitalize(key
                    .replace(/^createdAt$/, 'date')
                    .replace(/Id$/, '')
                    .replace(/[A-Z]/g, ' $&')
                ).trim();
                if (propName.endsWith('tag')) continue;

                const userStr = key === 'userId' ? `<@${objectItem.userId}> ${objectItem.userTag}` : null;
                const modStr = key === 'modId' ? `<@${objectItem.modId}> ${objectItem.modTag}` : null;
                const channel = key === 'channel' ? channels.resolve(objectItem[key] as string) : null;

                const created = key === 'createdAt' ? timestamp(objectItem[key] as number) : null;
                const duration = key === 'duration' && Number(objectItem[key])
                    ? prettyMs(objectItem[key] as number, {
                        verbose: true,
                        unitCount: 2,
                    })
                    : null;
                const endsAt = key === 'endsAt'
                    ? `${timestamp(objectItem[key] as number)} (${timestamp(objectItem[key] as number, 'R')})`
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

/**
 * Creates and manages confirmation buttons (y/n) for moderation actions
 * @param context The command context
 * @param options The button options
 */
export async function confirmButtons(context: CommandContext, options: ConfirmButtonsOptions): Promise<boolean> {
    const { id, author } = context;
    const { action, target, reason, duration, sendCancelled = true } = options;

    const ids = {
        yes: `${id}:yes`,
        no: `${id}:no`,
    };
    const targetStr = target instanceof User ? target.tag
        : target instanceof CommandoGuild ? target.name : target || null;

    const confirmEmbed = new EmbedBuilder()
        .setColor('Gold')
        .setFooter({
            text: 'The command will automatically be cancelled in 30 seconds.',
        });

    if (!targetStr && !reason && !duration) {
        confirmEmbed.setDescription(`**Are you sure you want to ${action}?**`);
    } else {
        confirmEmbed.addFields({
            name: `Are you sure you want to ${action}${targetStr ? ` ${targetStr}` : ''}?`,
            value: stripIndent`
                ${!targetStr ? '' : target instanceof User ? stripIndent`
                    **User:** ${target.toString()} ${target.tag}
                    **ID:** ${target.id}
                ` : `**Target:** ${targetStr}`}
                **Action:** ${action}
                ${reason ? `**Reason:** ${reason}` : ''}
                ${duration ? `**Duration:** ${duration}` : ''}
            `,
        });
    }

    const yesButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setCustomId(ids.yes)
        .setEmoji(customEmoji('check'));
    const noButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(ids.no)
        .setEmoji(customEmoji('cross'));

    const msg = await reply(context, {
        embeds: [confirmEmbed],
        components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(yesButton, noButton)],
    });

    const pushed = await msg?.awaitMessageComponent({
        filter: async int => {
            if (msg?.id !== int.message?.id) return false;
            if (int.user.id !== author.id) {
                await int.reply({
                    content: 'This interaction doesn\'t belong to you.', ephemeral: true,
                });
                return false;
            }
            return true;
        },
        time: 30_000,
        componentType: ComponentType.Button,
    }).catch(() => null);

    if (context.isMessage()) await msg?.delete();

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

export function applyDefaults<T extends object, U extends Partial<T>>(from: T, to: U): T & U {
    return Object.assign(deepCopy(from), to);
}

export function deepCopy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

export function enumToObject<T extends Record<string, unknown>>(o: T): Readonly<T> {
    return Object.keys(o)
        .filter((k) => typeof k !== 'number')
        .reduce((r, k) => (r[k] = o[k], r), emptyObject<T>());
}

export function emptyObject<T extends object>(): T {
    return JSON.parse('{}');
}

export async function fetchPartial<P extends AnyPartial>(object: P): Promise<Exclude<P, { partial: true }> | null> {
    return (!object.partial
        ? object
        : await object.fetch().catch(() => null)
    ) as Exclude<P, { partial: true }> | null;
}

export function yesOrNo<B extends boolean>(value: B | null): If<B, 'Yes ➜ No', 'No ➜ Yes'> {
    return (value ? 'Yes ➜ No' : 'No ➜ Yes') as If<B, 'Yes ➜ No', 'No ➜ Yes'>;
}

export function parseMessageToCommando<InGuild extends boolean = boolean>(
    message: CommandoifiedMessage<InGuild>
): CommandoMessage<InGuild> | null {
    const commandoMessage = new CommandoMessage(message.client, message);
    // @ts-expect-error: parseMessage is protected in CommandoDispatcher
    const parsedMessage = message.client.dispatcher.parseMessage(commandoMessage);
    return parsedMessage as CommandoMessage<InGuild> | null;
}

export function getSubCommand<T extends string>(message: CommandoMessage, defaultSubCommand?: T): T {
    return (
        CommandoMessage.parseArgs(message.content).map(s => s.toLowerCase())[1]
        ?? defaultSubCommand
    ) as T;
}

export function isTrue(b?: boolean): b is true {
    return b === true;
}

export function removeRepeated<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

/**
 * Array with items from `1` ➜ `length`
 */
export function arrayWithLength<T = number>(length: number, mapCallback?: (n: number) => T): T[] {
    const array = Array.from(Array(length).keys()).map(n => n + 1);
    if (!mapCallback) return array as T[];
    return array.map(mapCallback);
}

export function addOrdinalSuffix(n: number): string {
    if (Util.equals(n % 100, [11, 12, 13])) return `${n}th`;
    const lastDigit = n % 10;
    if (lastDigit === 1) return `${n}st`;
    if (lastDigit === 2) return `${n}nd`;
    if (lastDigit === 3) return `${n}rd`;
    return `${n}th`;
}

export async function validateArgInput<T extends ArgumentTypeString = ArgumentTypeString>(
    value: string | undefined, message: CommandoMessage, argument: Argument, type?: T
): Promise<boolean | string> {
    const argumentType = type ? message.client.registry.types.get(type) : argument.type;
    return argumentType?.validate(value, message, argument) ?? true;
}

export async function parseArgInput<T extends ArgumentTypeString = ArgumentTypeString>(
    value: string, message: CommandoMessage, argument: Argument, type?: T
): Promise<ArgumentTypeStringMap[T] | null> {
    const argumentType = type ? message.client.registry.types.get(type) : argument.type;
    const result = argumentType?.parse(value, message, argument) ?? null;
    return result as ArgumentTypeStringMap[T];
}

export function hyperlink<C extends string, L extends Nullable<string>>(
    content: C, url: L
): L extends undefined ? C : `[${C}](${L})` {
    if (url) return `[${content}](${url})` as L extends undefined ? C : `[${C}](${L})`;
    return content as L extends undefined ? C : `[${C}](${L})`;
}

export async function parseArgDate<T extends Date | number>(
    context: CommandContext,
    command: Command,
    argumentIndex: number,
    value: Nullable<T> | string,
    defaultValue?: string,
    fallbackValue?: T
): Promise<Nullable<T>> {
    if (context.isMessage() || Util.isNullish(value)) return value as Nullable<T>;
    const message = await context.fetchReply() as CommandoMessage;
    const argument = command.argsCollector?.args[argumentIndex];
    const type = argument?.type?.id.split('|')[0];
    const resultDate = await argument?.parse(
        value?.toString() ?? defaultValue ?? '', message
    ).catch(() => null) as Nullable<T>;
    if (Util.isNullish(resultDate) && Util.isNullish(fallbackValue)) {
        await reply(context, basicEmbed({
            color: 'Red',
            emoji: 'cross',
            description: `The ${type} you specified is invalid.`,
        }));
        return null;
    }
    return resultDate ?? fallbackValue;
}

export function djsLocaleToBing(
    locale: Locale
): 'en' | 'es' | 'nb' | 'pt' | 'sv' | 'zh-Hans' | 'zh-Hant' | (BingLanguageId & LocaleString) {
    const lang = locale as LocaleString;
    if (Util.equals(lang, ['en-GB', 'en-US'])) return 'en';
    if (lang === 'zh-CN') return 'zh-Hans';
    if (lang === 'zh-TW') return 'zh-Hant';
    if (lang === 'no') return 'nb';
    if (lang === 'pt-BR') return 'pt';
    if (lang === 'es-ES') return 'es';
    if (lang === 'sv-SE') return 'sv';
    return lang;
}

export function mergeRegexps(flags: RegExpFlag[], ...regexps: Array<RegExp | string>): RegExp {
    const merged = regexps.map(regex =>
        typeof regex === 'string' ? `(?:${regex})` : `(?:${regex.source})`
    ).join('|');
    if (flags.length === 0) return new RegExp(merged);
    return new RegExp(merged, flags.join(''));
}

export async function getContextMessage(
    context: CommandContext | CommandoMessageContextMenuCommandInteraction | CommandoUserContextMenuCommandInteraction
): Promise<Message> {
    return 'isMessage' in context && context.isMessage()
        ? context as Message
        : await context.fetchReply();
}
