import { PermissionsString } from 'discord.js';
import { default as importedEmojiRegex } from 'emoji-regex';
import { GenerateEmbedOptions } from './functions';

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
    GenerateEmbedOptions, 'authorIconURL' | 'authorName' | 'embedTitle' | 'keys' | 'numbered'>
> = {
    number: 6,
    color: '#4c9f4c',
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

export const emojiRegex = new RegExp(`${importedEmojiRegex().source}|\\d{17,20}`, 'g');

export const sevenDays = 604_800;
