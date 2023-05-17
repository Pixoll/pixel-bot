"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const timeZones = new discord_js_1.Collection([
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
    }];
class TimesCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'times',
            aliases: ['time'],
            group: 'misc',
            description: 'Displays the time in multiple timezones.',
            detailedDescription: (0, common_tags_1.stripIndent) `
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
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'hour',
                    description: 'The time of the day to check.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'place',
                    description: 'The place to check its time.',
                    autocomplete: true,
                }],
        });
    }
    async run(context, { hour, place }) {
        const passedHour = await (0, utils_1.parseArgDate)(context, this, 0, hour, 'now');
        if (context.isInteraction() && pixoll_commando_1.Util.isNullish(passedHour))
            return;
        const date = passedHour ?? new Date();
        const toMatch = context.isMessage()
            ? pixoll_commando_1.CommandoMessage.parseArgs(context.content)[1]
            : context.options.getString('hour');
        const is12Hour = !!toMatch?.match(/[ap]\.?m\.?/i)?.map(m => m)[0];
        if (place) {
            const timeZone = timeZones.findKey(city => city.toLowerCase() === place.toLowerCase());
            const city = timeZones.get(timeZone);
            const { offset, time } = mapDateToTimeZone(date, timeZone, city, is12Hour);
            const hour = parseInt(time.split(':')[0]);
            const clock = hour - (hour > 12 ? 12 : 0);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(utils_1.pixelColor)
                .setTitle(`:clock${clock}: Time in ${city}`)
                .setDescription((0, common_tags_1.stripIndent) `
                    **Time:** ${time}
                    **Time zone:** ${offset}
                `)
                .setTimestamp();
            await (0, utils_1.reply)(context, embed);
            return;
        }
        const times = timeZones.map((city, tz) => mapDateToTimeZone(date, tz, city, is12Hour));
        const sorted = times.sort((0, utils_1.alphabeticalOrder)({
            sortKey: 'city',
        }));
        const divisor = Math.round((sorted.length / 3) + 0.1);
        const firstPart = sorted.splice(0, divisor);
        const secondPart = sorted.splice(0, divisor);
        const thirdPart = sorted.splice(0, divisor);
        const hours = date.getUTCHours();
        const clock = hours - (hours > 12 ? 12 : 0) || 12;
        const base = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setTitle(`:clock${clock}: Times around the world`)
            .setTimestamp()
            .toJSON();
        const timesEmbed = (data) => new discord_js_1.EmbedBuilder(base)
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
        await (0, utils_1.pagedEmbed)(context, {
            number: 1,
            total: 3,
        }, (page) => ({
            embed: pages[page].setFooter({ text: `Page ${page + 1} of 3` }),
            total: 3,
        }));
    }
    async runAutocomplete(interaction) {
        const { options } = interaction;
        const query = options.getFocused().toLowerCase();
        const matches = cities
            .filter(city => city.toLowerCase().includes(query))
            .slice(0, 25)
            .sort()
            .map(city => ({
            name: city,
            value: city,
        }));
        await interaction.respond(matches);
    }
}
exports.default = TimesCommand;
function mapDateToTimeZone(date, timeZone, city, hour12) {
    const format = new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric', minute: 'numeric', timeZoneName: 'short', hour12, timeZone,
    }).format(date);
    const sliced = format.split(/ /g);
    const offset = sliced.pop();
    const time = sliced.join(' ');
    return { offset, time, city };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy90aW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FLb0I7QUFDcEIscURBU3lCO0FBQ3pCLHVDQUE2RjtBQUU3RixNQUFNLFNBQVMsR0FBRyxJQUFJLHVCQUFVLENBQUM7SUFDN0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0lBQ3pCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO0lBQzlCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDO0lBQ3RDLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDO0lBQ2xDLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDO0lBQzlCLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDO0lBQzlCLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDO0lBQzlCLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDO0lBQ3RDLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztJQUN4QixDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQztJQUNoQyxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQztJQUM5QixDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQztJQUNoQyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQztJQUM3QixDQUFDLGdDQUFnQyxFQUFFLFdBQVcsQ0FBQztJQUMvQyxDQUFDLHdCQUF3QixFQUFFLGVBQWUsQ0FBQztJQUMzQyxDQUFDLHFCQUFxQixFQUFFLFlBQVksQ0FBQztJQUNyQyxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUM7SUFDN0IsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO0lBQzNC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QyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMvRCxLQUFLLEVBQUUsQ0FBQztTQUNYLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUVlLEtBQUssQ0FBQyxlQUFlLENBQUMsV0FBNEM7UUFDOUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTTthQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2xELEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ1osSUFBSSxFQUFFO2FBQ04sR0FBRyxDQUFxQixJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUIsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQyxDQUFDO1FBRVIsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7Q0FDSjtBQTFIRCwrQkEwSEM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLElBQVUsRUFBRSxRQUFrQixFQUFFLElBQVUsRUFBRSxNQUFlO0lBQ2xGLE1BQU0sTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUU7UUFDNUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVE7S0FDOUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2xDLENBQUMifQ==