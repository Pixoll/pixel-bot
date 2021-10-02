const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { myMs } = require('../../utils')

/** A command that can be run in a client */
module.exports = class xpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'xp',
            group: 'owner',
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

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {CommandoMessage} args.msg The message to get the XP from
     */
    async run(message, { msg }) {
        const week = msg.content.split('\n').shift()
        const table = msg.content.replace(/ +/g, ' ').split('\n').slice(4)

        var XP = 0
        const tasks = []
        for (const row of table) {
            const [, , val, ..._task] = row.split(' ')
            const last = _task.pop()

            if (!val || val === '/' || last === '/') continue

            XP += Number(last)

            var task = _task.join(' ').toLowerCase()
            while (task.endsWith('/')) task = task.split(' ').slice(0, -2).join(' ')

            if (task === 'meeting') task = 'meetings'
            if (task.endsWith('event')) task = 'events'

            const match = tasks.find(target => target.task === task)
            const index = tasks.indexOf(match)

            /** @type {number} */
            const amount = (Number(val.slice(0, -1)) || 1) + (match?.amount || 0)

            const newTask = { amount, task }

            if (!match) tasks.push(newTask)
            else tasks.splice(index, 1, newTask)
        }

        if (!XP) return message.reply('you got no XP. :c')

        const command = tasks
            .sort((a, b) => {
                var taskA = a.task.toUpperCase()
                var taskB = b.task.toUpperCase()

                if (taskA < taskB) return -1
                if (taskA > taskB) return 1
                return 0
            })
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

        await message.delete()

        const m = await message.reply(`${week}\n\`\`\`!xp ${XP}\n${command}\`\`\``)
        await m.pin()

        const msgs = await message.channel.messages.fetch({ after: m.id }, false)
        const target = msgs.filter(({ reference }) => reference.messageId === m.id).first()
        await target.delete()
    }
}