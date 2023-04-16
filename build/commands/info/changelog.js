"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const { version } = require('../../../package.json');
const changelog = pixoll_commando_1.Util.filterNullishItems(require('../../../documents/changelog.json')
    .sort((0, utils_1.alphabeticalOrder)({
    sortKey: 'version',
}))
    .map(log => {
    if (version < log.version)
        return null;
    const changes = log.changes.length === 1
        ? log.changes[0]
        : log.changes.map((change, i) => `**${i + 1}.** ${change}`).join('\n');
    const title = `Version ${log.version} - ${log.timestamp
        ? (0, utils_1.timestamp)(log.timestamp, 'F', true)
        : 'No date specified'}`;
    return {
        title,
        changes,
    };
}));
class ChangelogCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'changelog',
            group: 'info',
            description: 'Displays the changelog history of the bot.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { user } = context.client;
        await (0, utils_1.generateEmbed)(context, changelog, {
            number: 5,
            authorName: `${user.username}'s changelog`,
            authorIconURL: user.displayAvatarURL({ forceStatic: false }),
            keyTitle: { suffix: 'title' },
            keys: ['changes'],
        });
    }
}
exports.default = ChangelogCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2luZm8vY2hhbmdlbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQWdGO0FBQ2hGLHVDQUEwRTtBQVUxRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFzQix1QkFBdUIsQ0FBQyxDQUFDO0FBRTFFLE1BQU0sU0FBUyxHQUFHLHNCQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFjLG1DQUFtQyxDQUFDO0tBQzlGLElBQUksQ0FBQyxJQUFBLHlCQUFpQixFQUFDO0lBQ3BCLE9BQU8sRUFBRSxTQUFTO0NBQ3JCLENBQUMsQ0FBQztLQUNGLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNQLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDdkMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUNwQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTNFLE1BQU0sS0FBSyxHQUFHLFdBQVcsR0FBRyxDQUFDLE9BQU8sTUFBTSxHQUFHLENBQUMsU0FBUztRQUNuRCxDQUFDLENBQUMsSUFBQSxpQkFBUyxFQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztRQUNyQyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUU1QixPQUFPO1FBQ0gsS0FBSztRQUNMLE9BQU87S0FDVixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVSLE1BQXFCLGdCQUFpQixTQUFRLHlCQUFPO0lBQ2pELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsT0FBTyxFQUFFLElBQUk7WUFDYix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUU7WUFDcEMsTUFBTSxFQUFFLENBQUM7WUFDVCxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxjQUFjO1lBQzFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDNUQsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtZQUM3QixJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUM7U0FDcEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBckJELG1DQXFCQyJ9