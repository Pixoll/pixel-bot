"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sevenDays = exports.emojiRegex = exports.defaultGenerateEmbedOptions = exports.validateUrlPattern = exports.moderatorPermissions = void 0;
const emoji_regex_1 = __importDefault(require("emoji-regex"));
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
exports.emojiRegex = new RegExp(`${(0, emoji_regex_1.default)().source}|\\d{17,20}`, 'g');
exports.sevenDays = 604800;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSw4REFBNEQ7QUFHL0MsUUFBQSxvQkFBb0IsR0FBaUM7SUFDOUQsWUFBWTtJQUNaLGVBQWU7SUFDZixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLHlCQUF5QjtJQUN6QixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGlCQUFpQjtJQUNqQixhQUFhO0lBQ2IsZUFBZTtJQUNmLGdCQUFnQjtJQUNoQixhQUFhO0lBQ2IsYUFBYTtDQUNoQixDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLE1BQU0sQ0FDeEMsbUJBQW1CLENBQUMsV0FBVztNQUM3QixrREFBa0QsQ0FBQyxjQUFjO01BQ2pFLDZCQUE2QixDQUFDLHFCQUFxQjtNQUNuRCxpQ0FBaUMsQ0FBQyxnQkFBZ0I7TUFDbEQsMEJBQTBCLENBQUMsZUFBZTtNQUMxQyxvQkFBb0IsRUFBRSxtQkFBbUI7QUFDM0MsR0FBRyxDQUNOLENBQUM7QUFFVyxRQUFBLDJCQUEyQixHQUVwQztJQUNBLE1BQU0sRUFBRSxDQUFDO0lBQ1QsS0FBSyxFQUFFLFNBQVM7SUFDaEIsY0FBYyxFQUFFLEtBQUs7SUFDckIsS0FBSyxFQUFFLEVBQUU7SUFDVCxNQUFNLEVBQUUsS0FBSztJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsS0FBSyxFQUFFLEVBQUU7SUFDVCxVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsRUFBRTtJQUNaLFdBQVcsRUFBRSxFQUFFO0lBQ2YsUUFBUSxFQUFFLEtBQUs7SUFDZixVQUFVLEVBQUUsRUFBRTtJQUNkLGNBQWMsRUFBRSxLQUFLO0NBQ3hCLENBQUM7QUFFVyxRQUFBLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUEscUJBQWtCLEdBQUUsQ0FBQyxNQUFNLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUUxRSxRQUFBLFNBQVMsR0FBRyxNQUFPLENBQUMifQ==