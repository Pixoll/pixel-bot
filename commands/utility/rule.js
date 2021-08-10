const { stripIndent } = require('common-tags')
const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')
const { rules: rulesDocs } = require('../../utils/mongodb-schemas')

module.exports = class rule extends Command {
    constructor(client) {
        super(client, {
            name: 'rule',
            group: 'utility',
            memberName: 'rule',
            description: 'Add or remove a rule from the server.',
            format: stripIndent`
                rule add [rule] - Add a new rule (admins only).
                rule remove [number] - Remove a rule (admins only).
            `,
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['add', 'remove']
                },
                {
                    key: 'rule',
                    prompt: 'What rule do you want to add/remove?',
                    type: 'string',
                    max: 512
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.subCommand The sub-command
     * @param {string} args.rule The number of the rule you want to remove
     */
    async run(message, { subCommand, rule }) {
        const { guild } = message

        const rulesData = await rulesDocs.findOne({ guild: guild.id })
        const rules = rulesData ? new Array(...rulesData.rules) : undefined

        if (subCommand.toLowerCase() === 'add') {
            if (!rules) await new rulesDocs({ guild: guild.id, rules: rule }).save()
            else await rulesData.updateOne({ $push: { rules: rule } })

            const number = rules ? ++rules.length : 1

            return message.say(basicEmbed('green', 'check', `Your rule has been added as rule number ${number}`))
        }

        if (!rules || rules.length === 0) return message.say(basicEmbed('blue', 'info', 'The are no saved rules for this server.'))

        var number = Math.abs(Number(rule))
        if (!number) return message.say(basicEmbed('red', 'cross', 'Please enter a valid number.'))

        const selected = rules[--number]
        if (!selected) return message.say(basicEmbed('red', 'cross', 'That rule doesn\'t exist.'))

        await rulesData.updateOne({ $pull: { rules: rules[number++] } })

        message.say(basicEmbed('green', 'check', `Removed rule number ${number--}:`, rules[number]))
    }
}