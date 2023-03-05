import { stripIndent } from 'common-tags';
import {
    EmbedBuilder,
    Collection,
    ApplicationCommandOptionType,
    ApplicationCommandOptionChoiceData as ChoiceData,
} from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    ParseRawArguments,
    CommandoMessage,
    CommandoAutocompleteInteraction,
    Util,
} from 'pixoll-commando';
import { abcOrder, pagedEmbed, replyAll, parseArgDate } from '../../utils';

const timeZones = new Collection([
    ['Pacific/Apia', 'Samoa'],
    ['Pacific/Honolulu', 'Hawaii'],
    ['Pacific/Tahiti', 'Tahiti'],
    ['America/Juneau', 'Alaska'],
    ['America/Los_Angeles', 'Los Angeles'],
    ['America/Vancouver', 'Vancouver'],
    ['America/Phoenix', 'Arizona'],
    ['America/Denver', 'Colorado'],
    ['America/Chicago', 'Chicago'],
    ['America/Mexico_City', 'Mexico City'],
    ['America/Bogota', 'Bogota'],
    ['America/Lima', 'Peru'],
    ['America/New_York', 'New York'],
    ['America/Toronto', 'Toronto'],
    ['America/Caracas', 'Venezuela'],
    ['America/Santiago', 'Chile'],
    ['America/Argentina/Buenos_Aires', 'Argentina'],
    ['Atlantic/South_Georgia', 'South Georgia'],
    ['Atlantic/Cape_Verde', 'Cape Verde'],
    ['Europe/Lisbon', 'Portugal'],
    ['Europe/London', 'London'],
    ['Europe/Paris', 'Central Europe'],
    ['Europe/Athens', 'Eastern Europe'],
    ['Europe/Moscow', 'Moscow'],
    ['Asia/Dubai', 'Dubai'],
    ['Asia/Tehran', 'Iran'],
    ['Asia/Kabul', 'Afghanistan'],
    ['Asia/Karachi', 'Pakistan'],
    ['Asia/Kolkata', 'India'],
    ['Asia/Bangkok', 'Thailand'],
    ['Asia/Jakarta', 'Western Indonesia'],
    ['Asia/Hong_Kong', 'China'],
    ['Asia/Tokyo', 'Japan'],
    ['Australia/Perth', 'Western Australia'],
    ['Australia/Darwin', 'Central Australia'],
    ['Australia/Sydney', 'Eastern Australia'],
    ['Pacific/Guadalcanal', 'Solomon Islands'],
    ['Pacific/Auckland', 'New Zealand'],
    ['Pacific/Fiji', 'Fiji'],
]);

const cities = timeZones.toJSON();

const args = [{
    key: 'hour',
    prompt: 'What hour would you like to check?',
    type: 'time',
    required: false,
    skipExtraDateValidation: true,
}, {
    key: 'place',
    prompt: 'What place would you like to check its time?',
    type: 'string',
    oneOf: cities,
    required: false,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TimesCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'times',
            aliases: ['time'],
            group: 'misc',
            description: 'Displays the time in multiple timezones.',
            details: stripIndent`
                \`hour\` uses the bot's time formatting, for more information use the \`help\` command.
                Type \`now\` to get the current time.
                \`place\` can be one of the following: ${cities.map(c => `"${c}"`).join(', ')}
            `,
            format: 'times <hour> <place>',
            examples: [
                'times 10am',
                'time "13:00 -5" London',
                'time now New York',
            ],
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'hour',
                description: 'The time of the day to check.',
            }, {
                type: ApplicationCommandOptionType.String,
                name: 'place',
                description: 'The place to check its time.',
                autocomplete: true,
            }],
        });
    }

    public async run(context: CommandContext, { hour, place }: ParsedArgs): Promise<void> {
        const passedHour = await parseArgDate(context, this as Command, 0, hour, 'now');
        if (context.isInteraction() && Util.isNullish(passedHour)) return;

        const date = passedHour ?? new Date();
        const toMatch = context.isMessage()
            ? CommandoMessage.parseArgs(context.content)[1]
            : context.options.getString('hour');
        const is12Hour = !!toMatch?.match(/[ap]\.?m\.?/i)?.map(m => m)[0];

        const times = [];

        if (place) {
            const timeZone = timeZones.findKey(city => city.toLowerCase() === place.toLowerCase()) as string;
            const city = timeZones.get(timeZone) as string;
            const { offset, time } = mapDateToTimeZone(date, timeZone, city, is12Hour);
            const hour = parseInt(time.split(':')[0]);
            const clock = hour - (hour > 12 ? 12 : 0);

            const embed = new EmbedBuilder()
                .setColor('#4c9f4c')
                .setTitle(`:clock${clock}: Time in ${city}`)
                .setDescription(stripIndent`
                    **Time:** ${time}
                    **Time zone:** ${offset}
                `)
                .setTimestamp();

            await replyAll(context, embed);
            return;
        }

        for (const timeZoneData of timeZones) {
            times.push(mapDateToTimeZone(date, ...timeZoneData, is12Hour));
        }

        const sorted = times.sort((a, b) => abcOrder(a.city, b.city));
        const divisor = Math.round((sorted.length / 3) + 0.1);

        const firstPart = sorted.splice(0, divisor);
        const secondPart = sorted.splice(0, divisor);
        const thirdPart = sorted.splice(0, divisor);

        const hours = date.getUTCHours();
        const clock = hours - (hours > 12 ? 12 : 0) || 12;

        const base = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setTitle(`:clock${clock}: Times around the world`)
            .setTimestamp()
            .toJSON();

        const timesEmbed = (data: TimeZoneData[]): EmbedBuilder => new EmbedBuilder(base)
            .addFields({
                name: 'City',
                value: data.map(d => d.city).join('\n'),
                inline: true,
            }, {
                name: 'Time',
                value: data.map(d => d.time).join('\n'),
                inline: true,
            }, {
                name: 'Time zone',
                value: data.map(d => d.offset).join('\n'),
                inline: true,
            });

        const pages = [timesEmbed(firstPart), timesEmbed(secondPart), timesEmbed(thirdPart)];

        await pagedEmbed(context, {
            number: 1,
            total: 3,
        }, (page: number) => ({
            embed: pages[page].setFooter({ text: `Page ${page + 1} of 3` }),
            total: 3,
        }));
    }

    public async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { options } = interaction;
        const query = options.getFocused().toLowerCase();
        const matches = cities
            .filter(city => city.toLowerCase().includes(query))
            .slice(0, 25)
            .sort()
            .map<ChoiceData<string>>(city => ({
                name: city,
                value: city,
            }));

        await interaction.respond(matches);
    }
}

function mapDateToTimeZone(date: Date, timeZone: string, city: string, hour12: boolean): TimeZoneData {
    const format = new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric', minute: 'numeric', timeZoneName: 'short', hour12, timeZone,
    }).format(date);
    const sliced = format.split(/ /g);
    const offset = sliced.pop();
    const time = sliced.join(' ');
    return { offset, time, city };
}

interface TimeZoneData {
    offset: string | undefined;
    time: string;
    city: string;
}
