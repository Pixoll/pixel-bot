"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const { version } = require('../../../package.json');
const changelog = pixoll_commando_1.Util.filterNullishItems(require('../../../documents/changelog.json')
    .sort((a, b) => (0, utils_1.abcOrder)(b.version, a.version))
    .map(log => {
    if (version < log.version)
        return null;
    const changes = log.changes.length === 1
        ? log.changes[0]
        : log.changes.map((change, i) => `**${i + 1}.** ${change}`).join('\n');
    const title = `Version ${log.version} - ${log.timestamp ? (0, utils_1.timestamp)(log.timestamp, 'F') : 'No date specified'}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2luZm8vY2hhbmdlbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQWdGO0FBQ2hGLHVDQUFpRTtBQVVqRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFzQix1QkFBdUIsQ0FBQyxDQUFDO0FBRTFFLE1BQU0sU0FBUyxHQUFHLHNCQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFjLG1DQUFtQyxDQUFDO0tBQzlGLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM5QyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFDUCxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3ZDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7UUFDcEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUzRSxNQUFNLEtBQUssR0FBRyxXQUFXLEdBQUcsQ0FBQyxPQUFPLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBQSxpQkFBUyxFQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFFaEgsT0FBTztRQUNILEtBQUs7UUFDTCxPQUFPO0tBQ1YsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFUixNQUFxQixnQkFBaUIsU0FBUSx5QkFBTztJQUNqRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFdBQVc7WUFDakIsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsNENBQTRDO1lBQ3pELE9BQU8sRUFBRSxJQUFJO1lBQ2Isd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QjtRQUNwQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNoQyxNQUFNLElBQUEscUJBQWEsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFO1lBQ3BDLE1BQU0sRUFBRSxDQUFDO1lBQ1QsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsY0FBYztZQUMxQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzVELFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7WUFDN0IsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXJCRCxtQ0FxQkMifQ==