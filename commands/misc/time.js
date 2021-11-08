const { stripIndent } = require('common-tags')
const { Collection, MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { timeDetails, abcOrder, pagedEmbed } = require('../../utils')

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

// todo in cmd details: \`place\` can be one of the following: ${cities.map(c => `"${c}"`).join(', ')}

/** A command that can be run in a client */
module.exports = class TimesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'times',
            aliases: ['time'],
            group: 'misc',
            description: 'Displays the time in multiple timezones.',
            details: timeDetails('hour'),
            format: 'times <hour>',
            args: [
                {
                    key: 'hour',
                    prompt: 'What hour would you like to check?',
                    type: 'time',
                    required: false,
                    skipValidation: true
                },
                // {
                //     key: 'place',
                //     prompt: 'What place would you like to check its time?',
                //     type: 'string',
                //     oneOf: cities,
                //     required: false
                // }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {Date} args.hour The hour to check
     */
    async run(message, { hour }) {
        const date = hour || new Date()

        const times = []
        /** @param {string} city */
        const timeZone = (tz, city) => {
            const format = new Intl.DateTimeFormat('en-GB', {
                hour: 'numeric', minute: 'numeric', timeZone: tz, timeZoneName: 'short'
            }).format(date)
            const [time, offset] = format.match(/(\d+:\d+) ([\w\W]+)/).slice(1, 3)
            return { offset, time, city }
        }

        for (const data of timeZones) times.push(timeZone(...data))

        const sorted = times.sort((a, b) => abcOrder(a.time, b.time))
        const first = sorted.find(t => t.offset === 'GMT-10')
        const index = sorted.indexOf(first)

        const otherHalf = sorted.splice(0, index)
        const final = [...sorted, ...otherHalf]
        const divisor = Math.round((final.length / 3) + 0.1)

        const firstPart = final.splice(0, divisor)
        const secondPart = final.splice(0, divisor)
        const thirdPart = final.splice(0, divisor)

        const base = new MessageEmbed()
            .setColor('#4c9f4c')
            .setTitle('🕒 Times around the world')
            .setTimestamp()

        const timesEmbed = /** @param {final} data */ data => {
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