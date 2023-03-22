import { lang } from 'bing-translate-api';
import { PermissionsString } from 'discord.js';
import defaultEmojiRegex from 'emoji-regex';
import { GenerateEmbedOptions } from './functions';

export const pixelColor = '#4c9f4c';

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
