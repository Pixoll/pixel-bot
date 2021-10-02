const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, basicCollector, myMs, embedColor, getArgument } = require('../../utils')
const { rules: rulesDocs } = require('../../mongo/schemas')
const { RuleSchema } = require('../../mongo/typings')
const { MessageEmbed } = require('discord.js')

/** A command that can be run in a client */
module.exports = class RuleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rule',
            group: 'utility',
            description: 'Add or remove a rule from the server.',
            format: stripIndent`
                rule view [number] - View a single rule.
                rule add - Add a new rule (server owner only).
                rule remove [number] - Remove a rule (server owner only).
            `,
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['view', 'add', 'remove']
                },
                {
                    key: 'rule',
                    prompt: 'What rule do you want to remove?',
                    type: 'integer',
                    min: 1,
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'add'|'remove'} args.subCommand The sub-command to use
     * @param {number} args.rule The number of the rule you want to remove
     */
    async run(message, { subCommand, rule }) {
        subCommand = subCommand.toLowerCase()
        const { guildId } = message

        /** @type {RuleSchema} */
        const rulesData = await rulesDocs.findOne({ guild: guildId })

        switch (subCommand) {
            case 'view':
                return await this.view(message, rulesData, rule)
            case 'add':
                return await this.add(message, rulesData)
            case 'remove':
                return await this.remove(message, rulesData, rule)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {RuleSchema} rulesData The rules data
     * @param {number} rule The rule to view
     */
    async view(message, rulesData, rule) {
        if (!rulesData || rulesData.rules.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The are no saved rules for this server.'
            }))
        }

        if (!rule || rule > rulesData.rules.length) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            rule = value
        }

        const { guild } = message

        const ruleEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setAuthor(`${guild.name}'s rules`, guild.iconURL({ dynamic: true }))
            .addField(`Rule ${rule--}`, rulesData.rules[rule])
            .setTimestamp()

        await message.replyEmbed(ruleEmbed)
    }

    /**
     * The `add` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {RuleSchema} rulesData The rules data
     */
    async add(message, rulesData) {
        let rule
        while (!rule || rule.length > 512) {
            const ruleMsg = await basicCollector(message, {
                fieldName: 'What rule do you want to add?'
            }, { time: myMs('2m') })
            if (!ruleMsg) return
            rule = ruleMsg.content
        }

        const { guildId } = message

        if (rulesData) await rulesData.updateOne({ $push: { rules: rule } })
        else await new rulesDocs({ guild: guildId, rules: rule }).save()

        const number = rulesData ? rulesData.rules.length + 1 : 1

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `The rule has been added under \`Rule ${number}\``
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {RuleSchema} rulesData The rules data
     * @param {number} rule The rule to remove from the rules list
     */
    async remove(message, rulesData, rule) {
        const { guild, author } = message

        if (guild.ownerId !== author.id) {
            return await this.onBlock(message, 'serverOwnerOnly')
        }

        if (!rule) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            rule = value
        }

        if (!rulesData || rulesData.rules.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The are no saved rules for this server.'
            }))
        }

        if (rule > rulesData.rules.length) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That rule doesn\'t exist.'
            }))
        }

        rule--
        await rulesData.updateOne({ $pull: { rules: rulesData.rules[rule] } })
        rule++

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', fieldName: `Removed rule number ${rule--}:`,
            fieldValue: rulesData.rules[rule]
        }))
    }
}