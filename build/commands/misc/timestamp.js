"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
            details: '`duration` uses the bot\'s time formatting, for more information use the `help` command.',
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
        if (context.isInteraction()) {
            const message = await context.fetchReply();
            const arg = this.argsCollector?.args[0];
            const resultDate = await arg?.parse(date?.toString() ?? 'now', message).catch(() => null) || null;
            if (!resultDate) {
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The date you specified is invalid.',
                }));
                return;
            }
            date = resultDate;
        }
        if (typeof date === 'number')
            date += Date.now();
        if (date instanceof Date)
            date = date.getTime();
        const timestamps = timestampLetters.map(letter => {
            const string = (0, functions_1.timestamp)(date, letter);
            return `\`${string}\` ${string}`;
        });
        await (0, functions_1.replyAll)(context, timestamps.join('\n'));
    }
}
exports.default = TimestampCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdGltZXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQThHO0FBQzlHLHFEQUF3RTtBQUV4RSxNQUFNLGdCQUFnQixHQUFvQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTlFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztRQUMxQix1QkFBdUIsRUFBRSxJQUFJO1FBQzdCLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBVSxDQUFDO0FBS1osTUFBcUIsZ0JBQWlCLFNBQVEseUJBQXlCO0lBQ25FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsV0FBVztZQUNqQixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDbkIsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsaURBQWlEO1lBQzlELE9BQU8sRUFBRSwwRkFBMEY7WUFDbkcsTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixRQUFRLEVBQUU7Z0JBQ04sZUFBZTtnQkFDZixzQkFBc0I7Z0JBQ3RCLDRCQUE0QjtnQkFDNUIsdUJBQXVCO2FBQzFCO1lBQ0QsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBYztRQUMxRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN6QixNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQXFCLENBQUM7WUFDOUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNsRyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNiLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLHNCQUFVLEVBQUM7b0JBQy9CLEtBQUssRUFBRSxLQUFLO29CQUNaLEtBQUssRUFBRSxPQUFPO29CQUNkLFdBQVcsRUFBRSxvQ0FBb0M7aUJBQ3BELENBQUMsQ0FBQyxDQUFDO2dCQUNKLE9BQU87YUFDVjtZQUNELElBQUksR0FBRyxVQUFVLENBQUM7U0FDckI7UUFFRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVE7WUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pELElBQUksSUFBSSxZQUFZLElBQUk7WUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhELE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHFCQUFTLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sS0FBSyxNQUFNLE1BQU0sTUFBTSxFQUFFLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDSjtBQTlDRCxtQ0E4Q0MifQ==