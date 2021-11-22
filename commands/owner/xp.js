/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { myMs, code, abcOrder } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class xpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'xp',
            group: 'owner',
            description: 'Gets the xp.',
            format: 'xp [message]',
            ownerOnly: true,
            hidden: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     */
    async run({ message }) {
        const fetched = await message.channel.messages.fetch({ before: message.id, limit: 1 })
        const { content } = fetched.first()

        const week = content.split('\n').shift()
        const table = content.replace(/ +/g, ' ').split('\n').slice(4)

        let XP = 0
        const tasks = []
        for (const row of table) {
            const [, , val, ..._task] = row.split(' ')
            const last = _task.pop()

            if (!val || val === '/' || last === '/') continue

            XP += Number(last)

            // eslint-disable-next-line no-var
            var task = _task.join(' ').toLowerCase()
            while (task.endsWith('/')) task = task.split(' ').slice(0, -2).join(' ')

            if (task === 'meeting') task = 'meetings'
            if (task.includes('event')) task = 'events'

            const match = tasks.find(target => target.task === task)
            const index = tasks.indexOf(match)

            /** @type {number} */
            const amount = (Number(val.slice(0, -1)) || 1) + (match?.amount || 0)

            const newTask = { amount, task }

            if (!match) tasks.push(newTask)
            else tasks.splice(index, 1, newTask)
        }

        if (!XP) return message.reply('you got no XP. :c')

        const command = tasks.sort((a, b) => abcOrder(a.task, b.task))
            .map(({ amount, task }) => {
                const _suffix = () => {
                    const str = task.toLowerCase()
                    if (str.includes('work') || str === 'events') return 'h'
                    return 'x'
                }

                const suffix = _suffix()
                const val = amount + suffix

                if (suffix === 'x') return `- ${val} ${task}`

                const time = myMs(myMs(val)).replace(', ', '')
                return `- ${time} ${task}`
            }).join('\n')

        await message?.delete()
        const m = await message.say(`${week}\n${code(`!xp ${XP}\n${command}`)}`)
        await m.pin()

        const msgs = await message.channel.messages.fetch({ after: m.id })
        const target = msgs.filter(msg => msg.reference.messageId === m.id).first()
        await target?.delete()
    }
}