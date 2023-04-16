import { Command, CommandContext, CommandoClient, ParseRawArguments, Util } from 'pixoll-commando';
import { timestamp, reply, parseArgDate } from '../../utils';

const timestampLetters: TimestampType[] = ['t', 'T', 'd', 'D', 'f', 'F', 'R'];

const args = [{
    key: 'date',
    prompt: 'What date should the timestamp have?',
    type: ['date', 'duration'],
    skipExtraDateValidation: true,
    default: 0,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TimestampCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
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

    public async run(context: CommandContext, { date }: ParsedArgs): Promise<void> {
        const parsedDate = await parseArgDate(context, this as Command, 0, date, 'now');
        if (context.isInteraction() && Util.isNullish(parsedDate)) return;
        date = parsedDate ?? 0;

        if (typeof date === 'number') date += Date.now();
        if (date instanceof Date) date = date.getTime();

        const timestamps = timestampLetters.map(letter => {
            const string = timestamp(date, letter);
            return `\`${string}\` ${string}`;
        });

        await reply(context, timestamps.join('\n'));
    }
}
