const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { formatDate, capitalize, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongo/schemas')

module.exports = class modlog extends Command {
    constructor(client) {
        super(client, {
            name: 'modlog',
            aliases: ['log'],
            group: 'mod',
            memberName: 'modlog',
            description: 'Show or delete a single moderation log.',
            details: stripIndent`
                The \`view\` sub-command will display the details of a single moderation log.
                \`modlog ID\` has to be a valid moderation log ID. To see all the moderation logs in this server use \`modlogs all\`.
                The \`delete\` sub-command will delete the specified \`modlog ID\`
            `,
            format: stripIndent`
                modlog view [modlog ID]
                modlog delete [modlog ID]
            `,
            examples: ['modlog aa2be4fab2d1'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['view', 'delete']
                },
                {
                    key: 'modlogID',
                    prompt: 'What is the ID of the mod log you want to view/delete?',
                    type: 'string',
                    max: 12
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
     * @param {string} args.modlogID The mod log ID
     */
    async run(message, { subCommand, modlogID }) {
        const modLog = await moderations.findOne({ guild: message.guild.id, _id: modlogID })
        if (!modLog) return message.say(basicEmbed('red', 'cross', 'That ID is either invalid or it does not exist.'))

        if (subCommand.toLowerCase() === 'delete') {
            await modLog.deleteOne()

            return message.say(basicEmbed('green', 'check', `Deleted moderation log with ID \`${modlogID}\``))
        }

        const { users } = this.client

        const user = users.cache.get(modLog.user) || await users.fetch(modLog.user, false, true).catch(() => null)
        const moderator = users.cache.get(modLog.mod) || await users.fetch(modLog.mod, false, true).catch(() => null)
        const duration = modLog.duration ? `**>** **Duration:** ${modLog.duration}` : ''

        const modlogInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(user?.tag || 'This user does no longer exist.', user?.displayAvatarURL({ dynamic: true }))
            .addField(`Mod log ${modLog.id}`, stripIndent`
                **>** **Type:** ${capitalize(modLog.type)}
                **>** **User:** ${user?.tag || 'This user does no longer exist.'}
                **>** **Moderator:** ${moderator?.tag || 'This user does no longer exist.'}
                **>** **Reason:** ${modLog.reason}
                ${duration}
            `)
            .setFooter('Mod log created')
            .setTimestamp(modLog.createdAt)

        message.say(modlogInfo)
    }
}