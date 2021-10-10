const { stripIndent, oneLine } = require('common-tags');
const { MessageActionRow, MessageButton } = require('discord.js');

// const stampsLink = 'https://discord.com/developers/docs/reference#message-formatting-timestamp-styles'
// const timeDetails = stripIndent`
//     ${oneLine`
//         \`date\` uses UK's date formatting and the 24-hour time format,
//         \`timestamp\` uses Discord's timestamp formatting (\`<t:epoch_time:fomat_letter>\`,
//         for more info check [this link](${stampsLink})), and \`time\` uses the command time formatting.
//     `}
//     For more information use the \`help\` command.
//     If the \`date\` is unvalid, I will try to get a valid \`timestamp\`, and finally a valid \`time\`.
// `

const userDetails = '`user` has to be a user\'s username, id or mention.'

/** @param {string} [tag] @param {boolean} [plural] */
const memberDetails = (tag, plural = false) => !plural ?
    `\`${tag || 'member'}\` can be either a member's name, mention or id.` :
    `\`${tag || 'members'}\` to be all the members' names, mentions or ids, separated by commas (max. 30 at once).`

/** @param {string} [tag] @param {boolean} [plural] */
const roleDetails = (tag, plural = false) => !plural ?
    `\`${tag || 'role'}\` can be either a role's name, mention or id.` :
    `\`${tag || 'roles'}\` to be all the roles' names, mentions or ids, separated by commas (max. 30 at once).`

/** @param {string} [tag] @param {boolean} [plural] */
const channelDetails = (tag, plural = false) => !plural ?
    `\`${tag || 'channel'}\` can be either a ${tag?.replace('-', ' ') || 'channel'}'s name, mention or id.` :
    oneLine`
        \`${tag || 'channels'}\` to be all the ${tag?.replace('-', ' ') || 'channels'}s'
        names, mentions or ids, separated by spaces (max. 30 at once).
    `

/** @param {string} tag */
const timeDetails = tag => stripIndent`
    \`${tag}\` uses the bot's time formatting, for more information use the \`help\` command.
`

/** @param {string} [reason] */
const reasonDetails = (reason = 'No reason given') =>
    `If \`reason\` is not specified, it will default as "${reason}".`

const randomDate = Math.trunc(Date.now() / 1000000) * 1000 + 10 ** 5

const inviteMaxAge = 604800

const defaultEmojiRegex = require('emoji-regex')()
const gEmojiIdRegex = /\d{18}/g
const guildEmojiRegex = /<a?:(\w+):(\d{18})>/g
const emojiRegex = new RegExp(`${defaultEmojiRegex.source}|${gEmojiIdRegex.source}`, 'g')

const embedColor = '#4c9f4c'

const channelTypes = {
    GUILD_TEXT: 'Text',
    DM: 'Direct messages',
    GUILD_VOICE: 'Voice',
    GROUP_DM: 'Group direct messages',
    GUILD_CATEGORY: 'Category',
    GUILD_NEWS: 'News',
    GUILD_STORE: 'Store',
    UNKNOWN: 'Unknown',
    GUILD_NEWS_THREAD: 'News thread',
    GUILD_PUBLIC_THREAD: 'Public thread',
    GUILD_PRIVATE_THREAD: 'Private thread',
    GUILD_STAGE_VOICE: 'Stage',
}

const rtcRegions = new Map([
    [null, 'Automatic'],
    ['brazil', 'Brazil'],
    ['europe', 'Europe'],
    ['hongkong', 'Hong Kong'],
    ['india', 'India'],
    ['japan', 'Japan'],
    ['russia', 'Russia'],
    ['singapore', 'Singapore'],
    ['southafrica', 'South Africa'],
    ['sydney', 'Sydney'],
    ['us-central', 'US Central'],
    ['us-east', 'US East'],
    ['us-south', 'US South'],
    ['us-west', 'US West']
])

const guildFeatures = {
    ANIMATED_ICON: 'Animated icon',
    BANNER: 'Banner',
    COMMERCE: 'Commerce',
    COMMUNITY: 'Community',
    DISCOVERABLE: 'Discoverable',
    FEATURABLE: 'Featurable',
    INVITE_SPLASH: 'Invite splash',
    MEMBER_VERIFICATION_GATE_ENABLED: 'Membership screening',
    NEWS: 'News',
    PARTNERED: 'Partened',
    PREVIEW_ENABLED: 'Preview',
    VANITY_URL: 'Vanity URL',
    VERIFIED: 'Verified',
    VIP_REGIONS: 'VIP Regions',
    WELCOME_SCREEN_ENABLED: 'Welcome screen',
    TICKETED_EVENTS_ENABLED: 'Ticketed events',
    MONETIZATION_ENABLED: 'Monetization',
    MORE_STICKERS: 'More stickers',
    THREE_DAY_THREAD_ARCHIVE: 'Thread 3 day archive',
    SEVEN_DAY_THREAD_ARCHIVE: 'Thread 1 week archive',
    PRIVATE_THREADS: 'Private threads',
}

const verificationLevels = {
    NONE: 'None',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    VERY_HIGH: 'Highest',
}

const R18ContentFilter = {
    DISABLED: 'Don\'t scan any media content',
    MEMBERS_WITHOUT_ROLES: 'Scan media content from members without a role',
    ALL_MEMBERS: 'Scan media content from all members',
}

const locales = new Map([
    ['en-US', 'English (United States)'],
    ['en-GB', 'English (Great Britain)'],
    ['zh-CN', 'Chinese (China)'],
    ['zh-TW', 'Chinese (Taiwan)'],
    ['cs', 'Czech'],
    ['da', 'Danish'],
    ['nl', 'Dutch'],
    ['fr', 'French'],
    ['de', 'German'],
    ['el', 'Greek'],
    ['hu', 'Hungarian'],
    ['it', 'Italian'],
    ['ja', 'Japanese'],
    ['ko', 'Korean'],
    ['no', 'Norwegian'],
    ['pl', 'Polish'],
    ['pt-BR', 'Portuguese (Brazil)'],
    ['ru', 'Russian'],
    ['es-ES', 'Spanish (Spain)'],
    ['sv-SE', 'Swedish'],
    ['tr', 'Turkish'],
    ['bg', 'Bulgarian'],
    ['uk', 'Ukrainian'],
    ['fi', 'Finnish'],
    ['hr', 'Croatian'],
    ['ro', 'Romanian'],
    ['lt', 'Lithuanian'],
])

const nsfwLevels = {
    DEFAULT: 'Default',
    EXPLICIT: 'Explicit',
    SAFE: 'Safe',
    AGE_RESTRICTED: 'Age restricted',
}

const sysChannelFlags = {
    SUPPRESS_JOIN_NOTIFICATIONS: 'Join messages',
    SUPPRESS_PREMIUM_SUBSCRIPTIONS: 'Server boosts messages',
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS: 'Server setup tips',
}

const userFlags = {
    HOUSE_BRAVERY: '<:bravery:894110822786281532>',
    HOUSE_BRILLIANCE: '<:brilliance:894110822626885663> ',
    HOUSE_BALANCE: '<:balance:894110823553855518>',
    HYPESQUAD_EVENTS: '<:hypesquad:894113047763898369>',
    DISCORD_EMPLOYEE: '<:discord_staff:894115772832546856>',
    PARTNERED_SERVER_OWNER: '<:partner:894116243785785344>',
    BUGHUNTER_LEVEL_1: '<:bug_hunter:894117053714292746>',
    BUGHUNTER_LEVEL_2: '<:bug_buster:894117053856878592>',
    EARLY_SUPPORTER: '<:early_supporter:894117997264896080>',
    EARLY_VERIFIED_BOT_DEVELOPER: '<:verified_developer:894117997378142238>',
    DISCORD_CERTIFIED_MODERATOR: '<:certified_moderator:894118624447586304>',
    VERIFIED_BOT: '<:verified_bot1:894251987087016006><:verified_bot2:894251987661647873>',
    TEAM_USER: '',
}

const disabledPageButtons = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setStyle('SECONDARY')
            .setCustomId('disabled_start')
            .setEmoji('⏪')
            .setDisabled(),
        new MessageButton()
            .setStyle('SECONDARY')
            .setCustomId('disabled_down')
            .setEmoji('⬅️')
            .setDisabled(),
        new MessageButton()
            .setStyle('SECONDARY')
            .setCustomId('disabled_up')
            .setEmoji('➡️')
            .setDisabled(),
        new MessageButton()
            .setStyle('SECONDARY')
            .setCustomId('disabled_end')
            .setEmoji('⏩')
            .setDisabled()
    )

module.exports = {
    channelDetails,
    channelTypes,
    defaultEmojiRegex,
    disabledPageButtons,
    embedColor,
    emojiRegex,
    guildEmojiRegex,
    guildFeatures,
    inviteMaxAge,
    locales,
    memberDetails,
    nsfwLevels,
    R18ContentFilter,
    randomDate,
    reasonDetails,
    roleDetails,
    rtcRegions,
    sysChannelFlags,
    timeDetails,
    userDetails,
    userFlags,
    verificationLevels,
}