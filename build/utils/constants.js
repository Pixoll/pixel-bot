"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultGenerateEmbedOptions = exports.validateUrlPattern = exports.moderatorPermissions = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHYSxRQUFBLG9CQUFvQixHQUFpQztJQUM5RCxZQUFZO0lBQ1osZUFBZTtJQUNmLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIseUJBQXlCO0lBQ3pCLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixlQUFlO0lBQ2YsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixhQUFhO0NBQ2hCLENBQUM7QUFFVyxRQUFBLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUN4QyxtQkFBbUIsQ0FBQyxXQUFXO01BQzdCLGtEQUFrRCxDQUFDLGNBQWM7TUFDakUsNkJBQTZCLENBQUMscUJBQXFCO01BQ25ELGlDQUFpQyxDQUFDLGdCQUFnQjtNQUNsRCwwQkFBMEIsQ0FBQyxlQUFlO01BQzFDLG9CQUFvQixFQUFFLG1CQUFtQjtBQUMzQyxHQUFHLENBQ04sQ0FBQztBQUVXLFFBQUEsMkJBQTJCLEdBRXBDO0lBQ0EsTUFBTSxFQUFFLENBQUM7SUFDVCxLQUFLLEVBQUUsU0FBUztJQUNoQixjQUFjLEVBQUUsS0FBSztJQUNyQixLQUFLLEVBQUUsRUFBRTtJQUNULE1BQU0sRUFBRSxLQUFLO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixLQUFLLEVBQUUsRUFBRTtJQUNULFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFFBQVEsRUFBRSxFQUFFO0lBQ1osV0FBVyxFQUFFLEVBQUU7SUFDZixRQUFRLEVBQUUsS0FBSztJQUNmLFVBQVUsRUFBRSxFQUFFO0lBQ2QsY0FBYyxFQUFFLEtBQUs7Q0FDeEIsQ0FBQyJ9