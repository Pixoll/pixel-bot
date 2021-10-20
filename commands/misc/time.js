const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed } = require('../../utils')

const timeZones = [
    'Pacific/Pago_Pago', 'Pacific/Honolulu', 'America/Adak', 'America/Anchorage', 'America/Phoenix',
    'America/Costa_Rica', 'America/Mexico_City', 'America/St_Thomas', 'America/Argentina/Buenos_Aires',
    'Atlantic/South_Georgia', 'Atlantic/Cape_Verde', 'Africa/Sao_Tome', 'Europe/London', 'Europe/Paris',
    'Europe/Moscow', 'Asia/Dubai', 'Asia/Karachi', 'Indian/Chagos', 'Asia/Jakarta', 'Asia/Hong_Kong',
    'Asia/Tokyo', 'Australia/Brisbane', 'Australia/Sydney', 'Pacific/Fiji', 'Pacific/Auckland'
]

/** A command that can be run in a client */
module.exports = class TimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'time',
            aliases: ['times'],
            group: 'misc',
            description: 'Displays the time in multiple timezones.',
            args: [{
                key: 'time',
                prompt: 'What time would you like to check?',
                type: 'time',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {Date} args.time The time to check
     */
    async run(message, { time }) {
        const date = time || new Date()

        const times = []
        /** @param {string} tz */
        const timeZone = tz => {
            const format = new Intl.DateTimeFormat('en-GB', {
                hour: 'numeric', minute: 'numeric', timeZone: tz, timeZoneName: 'short'
            }).format(date)
            const [number, string] = format.match(/(\d+:\d+) ([\w\W]+)/).slice(1, 3)
            return `**${string} >** ${number} (${tz.split(/\//g).pop().replace('_', ' ')})`
        }

        for (const tz of timeZones) times.push(timeZone(tz))

        await generateEmbed(message, times, {
            number: Math.round((timeZones.length / 2) + 0.1),
            embedTitle: '\\🕒 Times around the world',
            useDescription: true,
            skipMaxButtons: true
        })
    }
}