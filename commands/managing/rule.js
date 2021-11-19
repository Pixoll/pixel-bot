/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandInstances, CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, basicCollector, myMs, embedColor, getArgument } = require('../../utils')
const { RuleSchema } = require('../../schemas/types')
const { MessageEmbed } = require('discord.js')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RuleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rule',
            group: 'managing',
            description: 'Add or remove a rule from the server.',
            format: stripIndent`
                rule view [number] - View a single rule.
                rule add - Add a new rule (max. 512 characters) (server owner only).
                rule remove [number] - Remove a rule (server owner only).
            `,
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
                    prompt: 'What rule do you want to remove/add?',
                    type: 'string',
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'add'|'remove'} args.subCommand The sub-command to use
     * @param {string} args.rule The number of the rule you want to remove
     */
    async run({ message }, { subCommand, rule }) {
        subCommand = subCommand.toLowerCase()
        this.db = message.guild.database.rules
        const rulesData = await this.db.fetch()

        switch (subCommand) {
            case 'view':
                return await this.view(message, rulesData, rule)
            case 'add':
                return await this.add(message, rulesData, rule)
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

        if (message && (!rule || rule > rulesData.rules.length)) {
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
     * @param {string} rule The rule to add
     */
    async add(message, rulesData, rule) {
        const { guildId, guild, author, client } = message

        if (!client.isOwner(message) && guild.ownerId !== author.id) {
            return await this.onBlock({ message }, 'guildOwnerOnly')
        }

        while (!rule || rule.length > 512 || typeof rule === 'number') {
            const ruleMsg = await basicCollector({ message }, {
                fieldName: 'What rule do you want to add?'
            }, { time: myMs('2m') })
            if (!ruleMsg) return
            rule = ruleMsg.content
        }

        if (rulesData) await this.db.update(rulesData, { $push: { rules: rule } })
        else await this.db.add({ guild: guildId, rules: rule })

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
        const { guild, author, client } = message

        if (!client.isOwner(message) && guild.ownerId !== author.id) {
            return await this.onBlock({ message }, 'guildOwnerOnly')
        }

        rule = Number(rule) ?? null

        while (typeof rule !== 'number' || rule < 1) {
            const ruleMsg = await basicCollector({ message }, {
                fieldName: 'What rule do you want to remove?'
            }, { time: myMs('2m') })
            if (!ruleMsg) return
            rule = Number(ruleMsg.content)
        }

        if (message && !rule) {
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
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Removed rule number ${rule--}:`,
            fieldValue: rulesData.rules[rule]
        }))
    }
}