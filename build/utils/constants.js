"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTypeMap = exports.bingSupportedLanguages = exports.sevenDays = exports.emojiRegex = exports.defaultGenerateEmbedOptions = exports.validateUrlPattern = exports.moderatorPermissions = exports.pixelColor = void 0;
const bing_translate_api_1 = require("bing-translate-api");
const emoji_regex_1 = __importDefault(require("emoji-regex"));
exports.pixelColor = '#4c9f4c';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwyREFBMEM7QUFFMUMsOERBQTRDO0FBRy9CLFFBQUEsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUV2QixRQUFBLG9CQUFvQixHQUFpQztJQUM5RCxZQUFZO0lBQ1osZUFBZTtJQUNmLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIseUJBQXlCO0lBQ3pCLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixlQUFlO0lBQ2YsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixhQUFhO0NBQ2hCLENBQUM7QUFFVyxRQUFBLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUN4QyxtQkFBbUIsQ0FBQyxXQUFXO01BQzdCLGtEQUFrRCxDQUFDLGNBQWM7TUFDakUsNkJBQTZCLENBQUMscUJBQXFCO01BQ25ELGlDQUFpQyxDQUFDLGdCQUFnQjtNQUNsRCwwQkFBMEIsQ0FBQyxlQUFlO01BQzFDLG9CQUFvQixFQUFFLG1CQUFtQjtBQUMzQyxHQUFHLENBQ04sQ0FBQztBQUVXLFFBQUEsMkJBQTJCLEdBRXBDO0lBQ0EsU0FBUyxFQUFFLEtBQUs7SUFDaEIsTUFBTSxFQUFFLENBQUM7SUFDVCxLQUFLLEVBQUUsa0JBQVU7SUFDakIsY0FBYyxFQUFFLEtBQUs7SUFDckIsS0FBSyxFQUFFLEVBQUU7SUFDVCxNQUFNLEVBQUUsS0FBSztJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsS0FBSyxFQUFFLEVBQUU7SUFDVCxVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsRUFBRTtJQUNaLFdBQVcsRUFBRSxFQUFFO0lBQ2YsUUFBUSxFQUFFLEtBQUs7SUFDZixVQUFVLEVBQUUsRUFBRTtJQUNkLGNBQWMsRUFBRSxLQUFLO0NBQ3hCLENBQUM7QUFFVyxRQUFBLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUEscUJBQWlCLEdBQUUsQ0FBQyxNQUFNLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUV6RSxRQUFBLFNBQVMsR0FBRyxNQUFPLENBQUM7QUFFcEIsUUFBQSxzQkFBc0IsR0FBRyx5QkFBSSxDQUFDLEtBRTFDLENBQUM7QUFLVyxRQUFBLFlBQVksR0FBRztJQUN4QixPQUFPLEVBQUUsZUFBZTtJQUN4QixLQUFLLEVBQUUsY0FBYztJQUNyQixJQUFJLEVBQUUsYUFBYTtJQUNuQixTQUFTLEVBQUUscUJBQXFCO0lBQ2hDLFNBQVMsRUFBRSxvQkFBb0I7SUFDL0IsZ0JBQWdCLEVBQUUsNEJBQTRCO0lBQzlDLGNBQWMsRUFBRSxpQkFBaUI7Q0FDM0IsQ0FBQyJ9