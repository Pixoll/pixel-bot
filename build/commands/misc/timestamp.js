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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdGltZXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQW1HO0FBQ25HLHVDQUE2RDtBQUU3RCxNQUFNLGdCQUFnQixHQUFvQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTlFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztRQUMxQix1QkFBdUIsRUFBRSxJQUFJO1FBQzdCLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBVSxDQUFDO0FBS1osTUFBcUIsZ0JBQWlCLFNBQVEseUJBQXlCO0lBQ25FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsV0FBVztZQUNqQixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDbkIsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsaURBQWlEO1lBQzlELG1CQUFtQixFQUFFLDBGQUEwRjtZQUMvRyxNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLFFBQVEsRUFBRTtnQkFDTixlQUFlO2dCQUNmLHNCQUFzQjtnQkFDdEIsNEJBQTRCO2dCQUM1Qix1QkFBdUI7YUFDMUI7WUFDRCxJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQzFELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSxvQkFBWSxFQUFDLE9BQU8sRUFBRSxJQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRixJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxzQkFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7WUFBRSxPQUFPO1FBQ2xFLElBQUksR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDO1FBRXZCLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUTtZQUFFLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDakQsSUFBSSxJQUFJLFlBQVksSUFBSTtZQUFFLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFaEQsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUEsaUJBQVMsRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdkMsT0FBTyxLQUFLLE1BQU0sTUFBTSxNQUFNLEVBQUUsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0NBQ0o7QUFuQ0QsbUNBbUNDIn0=