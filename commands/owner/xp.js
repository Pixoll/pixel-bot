const { Command, CommandoMessage } = require('discord.js-commando')
const { ms } = require('../../utils/custom-ms')
const { pluralize } = require('../../utils/functions')

module.exports = class xp extends Command {
    constructor(client) {
        super(client, {
            name: 'xp',
            group: 'owner',
            memberName: 'xp',
            description: 'Gets the xp.',
            format: 'xp [message]',
            ownerOnly: true,
            hidden: true,
            args: [{
                key: 'msg',
                prompt: 'What is the message to get the XP from?',
                type: 'message'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {CommandoMessage} args.msg The message to get the XP from
     */
    async run(message, { msg }) {
        const week = msg.content.split('\n').shift()
        const table = msg.content.replace(/ +/g, ' ').split('\n').slice(4)

        var XP = 0
        const tasksList = []
        for (const row of table) {
            const [,, val, ...task] = row.split(' ')
            const last = task.pop()
            if (!val || val === '/' || last === '/') continue

            const _xp = Number(last)
            XP += _xp

            tasksList.push({
                val: Number(val.slice(0, -1)),
                task: task.join(' ')
            })
        }

        if (!XP) return message.reply('you got no XP. :c')

        const tasks = []
        for (const { task } of tasksList) {
            const match = tasks.find(arr => arr.task === task)
            if (match) continue

            const matches = tasksList.filter(target => target.task === task)
            const plural = pluralize(task, matches.length, false)

            var amount = 0
            for (const { val } of matches) amount += val

            tasks.push({ amount, task, plural })
        }

        const command = tasks.map(({ amount, plural }) => {
            const _suffix = () => {
                const str = plural.toLowerCase()
                if (str.includes('work') || str.includes('event') || str.includes('meeting')) return 'h'
                return 'x'
            }

            if (!amount) return plural

            const suffix = _suffix()
            const val = amount + suffix

            if (suffix === 'x') return `${val} ${plural}`

            const time = ms(ms(val)).replace(', ', '')
            return `${time} ${plural}`
        }).join(', ')

        message.say(`${week} \`!xp ${XP} ${command}\``).then(msg => msg.pin())
    }
}