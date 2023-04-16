import { lang } from 'bing-translate-api';
import { PermissionsString, UserFlagsString } from 'discord.js';
import defaultEmojiRegex from 'emoji-regex';
import { GenerateEmbedOptions, rgb } from './functions';

export const pixelColor = '#4c9f4c';
export const topggUrl = 'https://top.gg/bot/802267523058761759';
export const githubUrl = 'https://github.com/Pixoll/pixel-bot';
export const privacyPolicyUrl = `${githubUrl}/blob/dev/privacy-policy.md` as
    `${typeof githubUrl}/blob/dev/privacy-policy.md`;
export const termsOfServiceUrl = `${githubUrl}/blob/dev/terms-of-service.md` as
    `${typeof githubUrl}/blob/dev/terms-of-service.md`;

export const moderatorPermissions: readonly PermissionsString[] = [
    'BanMembers',
    'DeafenMembers',
    'KickMembers',
    'ManageChannels',
    'ManageEmojisAndStickers',
    'ManageGuild',
    'ManageMessages',
    'ManageNicknames',
    'ManageRoles',
    'ManageThreads',
    'ManageWebhooks',
    'MoveMembers',
    'MuteMembers',
];

export const validateUrlPattern = new RegExp(
    '^(https?:\\/\\/)?' // protocol
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
    + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
    + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
    + '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
);

export const defaultGenerateEmbedOptions: Required<Omit<
    GenerateEmbedOptions<object | string>, 'authorIconURL' | 'authorName' | 'embedTitle' | 'keys' | 'numbered'>
> = {
    ephemeral: false,
    number: 6,
    color: pixelColor,
    useDescription: false,
    title: '',
    inline: false,
    toUser: false,
    dmMsg: '',
    hasObjects: true,
    keyTitle: {},
    keysExclude: [],
    useDocId: false,
    components: [],
    skipMaxButtons: false,
};

export const emojiRegex = new RegExp(`${defaultEmojiRegex().source}|\\d{17,20}`, 'g');

export const sevenDays = 604_800;

export const bingSupportedLanguages = lang.LANGS as {
    readonly [P in keyof typeof lang.LANGS]: typeof lang.LANGS[P]
};

export type BingLanguageId = keyof typeof bingSupportedLanguages;
export type BingLanguage = PropertiesOf<typeof bingSupportedLanguages>;

export const errorTypeMap = {
    command: 'Command error',
    error: 'Client error',
    warn: 'Client warn',
    rejection: 'Unhandled rejection',
    exception: 'Uncaught exception',
    exceptionMonitor: 'Uncaught exception monitor',
    processWarning: 'Process warning',
} as const;

export type ErrorType = keyof typeof errorTypeMap;
export type ErrorTypeString = PropertiesOf<typeof errorTypeMap>;

export const userFlagToEmojiMap: Partial<Record<UserFlagsString, string>> = {
    BugHunterLevel1: '<:bug_hunter:894117053714292746>',
    BugHunterLevel2: '<:bug_buster:894117053856878592>',
    Hypesquad: '<:hypesquad:894113047763898369>',
    HypeSquadOnlineHouse1: '<:bravery:894110822786281532>',
    HypeSquadOnlineHouse2: '<:brilliance:894110822626885663>',
    HypeSquadOnlineHouse3: '<:balance:894110823553855518>',
    Partner: '<:partner:894116243785785344>',
    PremiumEarlySupporter: '<:early_supporter:894117997264896080>',
    Staff: '<:discord_staff:894115772832546856>',
    VerifiedBot: '<:verified_bot1:894251987087016006><:verified_bot2:894251987661647873>',
    VerifiedDeveloper: '<:verified_developer:894117997378142238>',
};

export const LogStyles = {
    Reset: '\x1b[0m',
    Bold: '\x1b[1m',
    Dim: '\x1b[2m',
    Italic: '\x1b[3m',
    Underline: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',
    Black: '\x1b[30m',
    Red: '\x1b[31m',
    Green: '\x1b[32m',
    Yellow: '\x1b[33m',
    Blue: '\x1b[34m',
    Magenta: '\x1b[35m',
    Cyan: '\x1b[36m',
    White: '\x1b[37m',
    Crimson: '\x1b[38m',
    LightGray: rgb(204, 204, 204),
    Gold: rgb(255, 193, 32),
    Aqua: rgb(0, 186, 124),
} as const;

export type LogStyleKey = keyof typeof LogStyles;
export type LogStyleResolvable = LogStyleKey | Tuple<number, 3>;
