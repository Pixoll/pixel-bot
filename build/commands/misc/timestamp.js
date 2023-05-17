"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const timestampLetters = ['t', 'T', 'd', 'D', 'f', 'F', 'R'];
const args = [{
        key: 'date',
        prompt: 'What date should the timestamp have?',
        type: ['date', 'duration'],
        skipExtraDateValidation: true,
        default: 0,
    }];
class TimestampCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'timestamp',
            aliases: ['tstamp'],
            group: 'misc',
            description: 'Get the Discord timestamp of any time you want.',
            detailedDescription: '`duration` uses the bot\'s time formatting, for more information use the `help` command.',
            format: 'timestamp <date>',
            examples: [
                'timestamp 3pm',
                'timestamp 22/10/2021',
                'timestamp 24/12/2022 23:59',
                'timestamp 2/2 10pm -3',
            ],
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { date }) {
        const parsedDate = await (0, utils_1.parseArgDate)(context, this, 0, date, 'now');
        if (context.isInteraction() && pixoll_commando_1.Util.isNullish(parsedDate))
            return;
        date = parsedDate ?? 0;
        if (typeof date === 'number')
            date += Date.now();
        if (date instanceof Date)
            date = date.getTime();
        const timestamps = timestampLetters.map(letter => {
            const string = (0, utils_1.timestamp)(date, letter);
            return `\`${string}\` ${string}`;
        });
        await (0, utils_1.reply)(context, timestamps.join('\n'));
    }
}
exports.default = TimestampCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdGltZXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQXlIO0FBQ3pILHVDQUE2RDtBQUU3RCxNQUFNLGdCQUFnQixHQUFvQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTlFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztRQUMxQix1QkFBdUIsRUFBRSxJQUFJO1FBQzdCLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBb0QsQ0FBQztBQUt0RCxNQUFxQixnQkFBaUIsU0FBUSx5QkFBeUI7SUFDbkUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxXQUFXO1lBQ2pCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNuQixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxpREFBaUQ7WUFDOUQsbUJBQW1CLEVBQUUsMEZBQTBGO1lBQy9HLE1BQU0sRUFBRSxrQkFBa0I7WUFDMUIsUUFBUSxFQUFFO2dCQUNOLGVBQWU7Z0JBQ2Ysc0JBQXNCO2dCQUN0Qiw0QkFBNEI7Z0JBQzVCLHVCQUF1QjthQUMxQjtZQUNELElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDMUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsT0FBTyxFQUFFLElBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hGLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLHNCQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztZQUFFLE9BQU87UUFDbEUsSUFBSSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUM7UUFFdkIsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRO1lBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNqRCxJQUFJLElBQUksWUFBWSxJQUFJO1lBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVoRCxNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN2QyxPQUFPLEtBQUssTUFBTSxNQUFNLE1BQU0sRUFBRSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7Q0FDSjtBQW5DRCxtQ0FtQ0MifQ==