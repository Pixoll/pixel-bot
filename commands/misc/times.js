const { stripIndent } = require('common-tags')
const { Collection, MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { timeDetails, abcOrder, pagedEmbed, embedColor } = require('../../utils')

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
    ['Pacific/Fiji', 'Fiji']
])

const cities = timeZones.map(t => t).sort()

/** A command that can be run in a client */
module.exports = class TimesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'times',
            aliases: ['time'],
            group: 'misc',
            description: 'Displays the time in multiple timezones.',
            details: stripIndent`
                ${timeDetails('hour')} Type \`now\` to get the current time.
                \`place\` can be one of the following: ${cities.map(c => `"${c}"`).join(', ')}
            `,
            format: 'times <hour>',
            args: [
                {
                    key: 'hour',
                    prompt: 'What hour would you like to check?',
                    type: 'time',
                    required: false,
                    skipValidation: true
                },
                {
                    key: 'place',
                    prompt: 'What place would you like to check its time?',
                    type: 'string',
                    oneOf: cities,
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {Date} args.hour The hour to check
     * @param {string} args.place The place to check
     */
    async run(message, { hour, place }) {
        const date = hour || new Date()
        const is12Hour = !!message.parseArgs().trim().match(/[aApP]\.?[mM]\.?/)?.map(m => m)[0]

        const times = []
        /** @param {string} city */
        const timeZone = (tz, city) => {
            const format = new Intl.DateTimeFormat('en-GB', {
                hour: 'numeric', minute: 'numeric', timeZone: tz, timeZoneName: 'short', hour12: is12Hour
            }).format(date)
            const sliced = format.split(/ /g)
            const offset = sliced.pop()
            const time = sliced.join(' ')
            return { offset, time, city }
        }

        if (place) {
            const tz = timeZones.findKey(city => city.toLowerCase() === place.toLowerCase())
            const city = timeZones.get(tz)
            const { offset, time } = timeZone(tz, city)
            const hour = Number.parseInt(time.split(':').shift())
            const clock = hour - (hour > 12 ? 12 : 0)

            const embed = new MessageEmbed()
                .setColor(embedColor)
                .setTitle(`:clock${clock}: Time in ${city}`)
                .setDescription(stripIndent`
                    **Time:** ${time}
                    **Time zone:** ${offset}
                `)
                .setTimestamp()

            return await message.replyEmbed(embed)
        }

        for (const data of timeZones) times.push(timeZone(...data))

        const sorted = times.sort((a, b) => abcOrder(a.city, b.city))
        const divisor = Math.round((sorted.length / 3) + 0.1)

        const firstPart = sorted.splice(0, divisor)
        const secondPart = sorted.splice(0, divisor)
        const thirdPart = sorted.splice(0, divisor)

        const hours = date.getUTCHours()
        const clock = hours - (hours > 12 ? 12 : 0)
        console.log(date, hours, clock)

        const base = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(`:clock${clock}: Times around the world`)
            .setTimestamp()

        const timesEmbed = /** @param {sorted} data */ data => {
            return new MessageEmbed(base)
                .addField('City', data.map(d => d.city).join('\n'), true)
                .addField('Time', data.map(d => d.time).join('\n'), true)
                .addField('Time zone', data.map(d => d.offset).join('\n'), true)
        }

        const pages = [timesEmbed(firstPart), timesEmbed(secondPart), timesEmbed(thirdPart)]

        const generate = page => ({
            embed: pages[page].setFooter(`Page ${++page} of 3`)
        })

        await pagedEmbed(message, { number: 1, total: 3 }, generate)
    }
}