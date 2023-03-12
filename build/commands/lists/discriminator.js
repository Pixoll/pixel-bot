"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'number',
        prompt: 'What discriminator do you want to look for?',
        type: 'integer',
        min: 1,
        max: 9999,
    }];
class DiscriminatorCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'discriminator',
            aliases: ['discrim'],
            group: 'lists',
            description: 'Displays a list of users with a discriminator.',
            detailedDescription: '`number` has to be a number from 1 to 9999.',
            format: 'discriminator [number]',
            examples: ['discriminator 1234'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { number }) {
        const { guild } = context;
        const members = guild.members.cache;
        const discriminator = number.toString().padStart(4, '0').slice(-4);
        const match = members.filter(member => member.user.discriminator === discriminator)
            .sort((a, b) => (0, utils_1.abcOrder)(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`);
        if (!match || match.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find any members.',
            }));
            return;
        }
        await (0, utils_1.generateEmbed)(context, match, {
            number: 20,
            authorName: `Found ${(0, utils_1.pluralize)('member', match.length)} with discriminator #${discriminator}`,
            useDescription: true,
        });
    }
}
exports.default = DiscriminatorCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY3JpbWluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9kaXNjcmltaW5hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTZGO0FBQzdGLHVDQUF1RjtBQUV2RixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsNkNBQTZDO1FBQ3JELElBQUksRUFBRSxTQUFTO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixHQUFHLEVBQUUsSUFBSTtLQUNaLENBQVUsQ0FBQztBQUtaLE1BQXFCLG9CQUFxQixTQUFRLHlCQUFzQjtJQUNwRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGVBQWU7WUFDckIsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDO1lBQ3BCLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLGdEQUFnRDtZQUM3RCxtQkFBbUIsRUFBRSw2Q0FBNkM7WUFDbEUsTUFBTSxFQUFFLHdCQUF3QjtZQUNoQyxRQUFRLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztZQUNoQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxNQUFNLEVBQWM7UUFDbEUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUNwQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVuRSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssYUFBYSxDQUFDO2FBQzlFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hELEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzlCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSwrQkFBK0I7YUFDL0MsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUEscUJBQWEsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFO1lBQ2hDLE1BQU0sRUFBRSxFQUFFO1lBQ1YsVUFBVSxFQUFFLFNBQVMsSUFBQSxpQkFBUyxFQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLHdCQUF3QixhQUFhLEVBQUU7WUFDN0YsY0FBYyxFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBeENELHVDQXdDQyJ9