"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogStyles = exports.userFlagToEmojiMap = exports.errorTypeMap = exports.bingSupportedLanguages = exports.sevenDays = exports.emojiRegex = exports.defaultGenerateEmbedOptions = exports.validateUrlPattern = exports.moderatorPermissions = exports.termsOfServiceUrl = exports.privacyPolicyUrl = exports.githubUrl = exports.topggUrl = exports.pixelColor = void 0;
const bing_translate_api_1 = require("bing-translate-api");
const emoji_regex_1 = __importDefault(require("emoji-regex"));
const functions_1 = require("./functions");
exports.pixelColor = '#4c9f4c';
exports.topggUrl = 'https://top.gg/bot/802267523058761759';
exports.githubUrl = 'https://github.com/Pixoll/pixel-bot';
exports.privacyPolicyUrl = `${exports.githubUrl}/blob/dev/privacy-policy.md`;
exports.termsOfServiceUrl = `${exports.githubUrl}/blob/dev/terms-of-service.md`;
exports.moderatorPermissions = [
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
exports.validateUrlPattern = new RegExp('^(https?:\\/\\/)?' // protocol
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
    + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
    + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
    + '(\\#[-a-z\\d_]*)?$', // fragment locator
'i');
exports.defaultGenerateEmbedOptions = {
    ephemeral: false,
    number: 6,
    color: exports.pixelColor,
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
exports.emojiRegex = new RegExp(`${(0, emoji_regex_1.default)().source}|\\d{17,20}`, 'g');
exports.sevenDays = 604800;
exports.bingSupportedLanguages = bing_translate_api_1.lang.LANGS;
exports.errorTypeMap = {
    command: 'Command error',
    error: 'Client error',
    warn: 'Client warn',
    rejection: 'Unhandled rejection',
    exception: 'Uncaught exception',
    exceptionMonitor: 'Uncaught exception monitor',
    processWarning: 'Process warning',
};
exports.userFlagToEmojiMap = {
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
exports.LogStyles = {
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
    LightGray: (0, functions_1.rgb)(204, 204, 204),
    Gold: (0, functions_1.rgb)(255, 193, 32),
    Aqua: (0, functions_1.rgb)(0, 186, 124),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwyREFBMEM7QUFFMUMsOERBQTRDO0FBQzVDLDJDQUF3RDtBQUUzQyxRQUFBLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDdkIsUUFBQSxRQUFRLEdBQUcsdUNBQXVDLENBQUM7QUFDbkQsUUFBQSxTQUFTLEdBQUcscUNBQXFDLENBQUM7QUFDbEQsUUFBQSxnQkFBZ0IsR0FBRyxHQUFHLGlCQUFTLDZCQUNRLENBQUM7QUFDeEMsUUFBQSxpQkFBaUIsR0FBRyxHQUFHLGlCQUFTLCtCQUNTLENBQUM7QUFFMUMsUUFBQSxvQkFBb0IsR0FBaUM7SUFDOUQsWUFBWTtJQUNaLGVBQWU7SUFDZixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLHlCQUF5QjtJQUN6QixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGlCQUFpQjtJQUNqQixhQUFhO0lBQ2IsZUFBZTtJQUNmLGdCQUFnQjtJQUNoQixhQUFhO0lBQ2IsYUFBYTtDQUNoQixDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLE1BQU0sQ0FDeEMsbUJBQW1CLENBQUMsV0FBVztNQUM3QixrREFBa0QsQ0FBQyxjQUFjO01BQ2pFLDZCQUE2QixDQUFDLHFCQUFxQjtNQUNuRCxpQ0FBaUMsQ0FBQyxnQkFBZ0I7TUFDbEQsMEJBQTBCLENBQUMsZUFBZTtNQUMxQyxvQkFBb0IsRUFBRSxtQkFBbUI7QUFDM0MsR0FBRyxDQUNOLENBQUM7QUFFVyxRQUFBLDJCQUEyQixHQUVwQztJQUNBLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLE1BQU0sRUFBRSxDQUFDO0lBQ1QsS0FBSyxFQUFFLGtCQUFVO0lBQ2pCLGNBQWMsRUFBRSxLQUFLO0lBQ3JCLEtBQUssRUFBRSxFQUFFO0lBQ1QsTUFBTSxFQUFFLEtBQUs7SUFDYixNQUFNLEVBQUUsS0FBSztJQUNiLEtBQUssRUFBRSxFQUFFO0lBQ1QsVUFBVSxFQUFFLElBQUk7SUFDaEIsUUFBUSxFQUFFLEVBQUU7SUFDWixXQUFXLEVBQUUsRUFBRTtJQUNmLFFBQVEsRUFBRSxLQUFLO0lBQ2YsVUFBVSxFQUFFLEVBQUU7SUFDZCxjQUFjLEVBQUUsS0FBSztDQUN4QixDQUFDO0FBRVcsUUFBQSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFBLHFCQUFpQixHQUFFLENBQUMsTUFBTSxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFekUsUUFBQSxTQUFTLEdBQUcsTUFBTyxDQUFDO0FBRXBCLFFBQUEsc0JBQXNCLEdBQUcseUJBQUksQ0FBQyxLQUUxQyxDQUFDO0FBS1csUUFBQSxZQUFZLEdBQUc7SUFDeEIsT0FBTyxFQUFFLGVBQWU7SUFDeEIsS0FBSyxFQUFFLGNBQWM7SUFDckIsSUFBSSxFQUFFLGFBQWE7SUFDbkIsU0FBUyxFQUFFLHFCQUFxQjtJQUNoQyxTQUFTLEVBQUUsb0JBQW9CO0lBQy9CLGdCQUFnQixFQUFFLDRCQUE0QjtJQUM5QyxjQUFjLEVBQUUsaUJBQWlCO0NBQzNCLENBQUM7QUFLRSxRQUFBLGtCQUFrQixHQUE2QztJQUN4RSxlQUFlLEVBQUUsa0NBQWtDO0lBQ25ELGVBQWUsRUFBRSxrQ0FBa0M7SUFDbkQsU0FBUyxFQUFFLGlDQUFpQztJQUM1QyxxQkFBcUIsRUFBRSwrQkFBK0I7SUFDdEQscUJBQXFCLEVBQUUsa0NBQWtDO0lBQ3pELHFCQUFxQixFQUFFLCtCQUErQjtJQUN0RCxPQUFPLEVBQUUsK0JBQStCO0lBQ3hDLHFCQUFxQixFQUFFLHVDQUF1QztJQUM5RCxLQUFLLEVBQUUscUNBQXFDO0lBQzVDLFdBQVcsRUFBRSx3RUFBd0U7SUFDckYsaUJBQWlCLEVBQUUsMENBQTBDO0NBQ2hFLENBQUM7QUFFVyxRQUFBLFNBQVMsR0FBRztJQUNyQixLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFJLEVBQUUsU0FBUztJQUNmLEdBQUcsRUFBRSxTQUFTO0lBQ2QsTUFBTSxFQUFFLFNBQVM7SUFDakIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsS0FBSyxFQUFFLFNBQVM7SUFDaEIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsTUFBTSxFQUFFLFNBQVM7SUFDakIsS0FBSyxFQUFFLFVBQVU7SUFDakIsR0FBRyxFQUFFLFVBQVU7SUFDZixLQUFLLEVBQUUsVUFBVTtJQUNqQixNQUFNLEVBQUUsVUFBVTtJQUNsQixJQUFJLEVBQUUsVUFBVTtJQUNoQixPQUFPLEVBQUUsVUFBVTtJQUNuQixJQUFJLEVBQUUsVUFBVTtJQUNoQixLQUFLLEVBQUUsVUFBVTtJQUNqQixPQUFPLEVBQUUsVUFBVTtJQUNuQixTQUFTLEVBQUUsSUFBQSxlQUFHLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7SUFDN0IsSUFBSSxFQUFFLElBQUEsZUFBRyxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ3ZCLElBQUksRUFBRSxJQUFBLGVBQUcsRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNoQixDQUFDIn0=