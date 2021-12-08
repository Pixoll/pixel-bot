/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { basicEmbed, basicCollector, getArgument, replyAll } = require('../../utils/functions')
const ms = require('../../utils/ms')
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
                rule add [rule] - Add a new rule (server owner only).
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
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'view',
                        description: 'View a single rule.',
                        options: [{
                            type: 'integer',
                            name: 'rule',
                            description: 'The number of the rule to view.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'add',
                        description: 'Add a new rule (server owner only).',
                        options: [{
                            type: 'string',
                            name: 'rule',
                            description: 'The rule you want to add.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'remove',
                        description: 'Remove a rule (server owner only).',
                        options: [{
                            type: 'integer',
                            name: 'rule',
                            description: 'The number of the rule to remove.',
                            required: true
                        }]
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'add'|'remove'} args.subCommand The sub-command to use
     * @param {string} args.rule The number of the rule you want to remove
     */
    async run({ message, interaction }, { subCommand, rule }) {
        subCommand = subCommand.toLowerCase()
        this.db = (message || interaction).guild.database.rules
        const rulesData = await this.db.fetch()

        switch (subCommand) {
            case 'view':
                return await this.view({ message, interaction }, rulesData, rule)
            case 'add':
                return await this.add({ message, interaction }, rulesData, rule)
            case 'remove':
                return await this.remove({ message, interaction }, rulesData, rule)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {RuleSchema} rulesData The rules data
     * @param {number} rule The rule to view
     */
    async view({ message, interaction }, rulesData, rule) {
        if (!rulesData || rulesData.rules.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The are no saved rules for this server.'
            }))
        }

        if (message && (!rule || rule > rulesData.rules.length)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            rule = value
        }

        const { guild } = message || interaction

        const ruleEmbed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s rules`, guild.iconURL({ dynamic: true }))
            .addField(`Rule ${rule--}`, rulesData.rules[rule])
            .setTimestamp()

        await replyAll({ message, interaction }, ruleEmbed)
    }

    /**
     * The `add` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {RuleSchema} rulesData The rules data
     * @param {string} rule The rule to add
     */
    async add({ message, interaction }, rulesData, rule) {
        const { guildId, guild, client } = message || interaction
        const author = message?.author || interaction.user

        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            return await this.onBlock({ message, interaction }, 'guildOwnerOnly')
        }

        if (message) {
            while (!rule || rule.length > 1024 || typeof rule === 'number') {
                const ruleMsg = await basicCollector({ message }, {
                    fieldName: 'What rule do you want to add?'
                }, { time: ms('2m') })
                if (!ruleMsg) return
                rule = ruleMsg.content
            }
        } else if (rule.length > 1024) {
            return await replyAll({ interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'The rule must be at most 1024 characters long.'
            }))
        }

        if (rulesData) await this.db.update(rulesData, { $push: { rules: rule } })
        else await this.db.add({ guild: guildId, rules: rule })

        const number = rulesData ? rulesData.rules.length + 1 : 1

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `The rule has been added under \`Rule ${number}\``
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {RuleSchema} rulesData The rules data
     * @param {number} rule The rule to remove from the rules list
     */
    async remove({ message, interaction }, rulesData, rule) {
        if (!rulesData || rulesData.rules.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The are no saved rules for this server.'
            }))
        }

        const { guild, client } = message || interaction
        const author = message?.author || interaction.user

        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            return await this.onBlock({ message, interaction }, 'guildOwnerOnly')
        }

        rule = Number(rule) || null

        if (message) {
            while (typeof rule !== 'number' || rule < 1) {
                const ruleMsg = await basicCollector({ message }, {
                    fieldName: 'What rule do you want to remove?'
                }, { time: ms('2m') })
                if (!ruleMsg) return
                rule = Number(ruleMsg.content)
            }
        }

        if (rule > rulesData.rules.length) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That rule doesn\'t exist.'
            }))
        }

        rule--
        await rulesData.updateOne({ $pull: { rules: rulesData.rules[rule] } })
        rule++

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Removed rule number ${rule--}:`,
            fieldValue: rulesData.rules[rule]
        }))
    }
}