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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy90aW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FLb0I7QUFDcEIscURBUXlCO0FBQ3pCLHVDQUE2RjtBQUU3RixNQUFNLFNBQVMsR0FBRyxJQUFJLHVCQUFVLENBQUM7SUFDN0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0lBQ3pCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO0lBQzlCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDO0lBQ3RDLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDO0lBQ2xDLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDO0lBQzlCLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDO0lBQzlCLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDO0lBQzlCLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDO0lBQ3RDLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztJQUN4QixDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQztJQUNoQyxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQztJQUM5QixDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQztJQUNoQyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQztJQUM3QixDQUFDLGdDQUFnQyxFQUFFLFdBQVcsQ0FBQztJQUMvQyxDQUFDLHdCQUF3QixFQUFFLGVBQWUsQ0FBQztJQUMzQyxDQUFDLHFCQUFxQixFQUFFLFlBQVksQ0FBQztJQUNyQyxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUM7SUFDN0IsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO0lBQzNC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