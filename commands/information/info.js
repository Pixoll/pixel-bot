const { Command, version: commandoVersion, CommandoMessage } = require('discord.js-commando')
const { version } = require('../../package.json')
const { ms } = require('../../utils/custom-ms')
const { MessageEmbed } = require('discord.js')
const { stripIndent } = require('common-tags')

// the memory usage
const usedMemory = Math.round(process.memoryUsage().heapUsed / (10 ** 4)) / 100 // used memory in MB
const maxMemory = Math.round(process.memoryUsage().rss / (10 ** 4)) / 100 // max memory in MB

module.exports = class info extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            aliases: ['about'],
            group: 'info',
            memberName: 'info',
            description: 'Displays detailed information about the bot, such as the version, statistics, and the support server link.',
            guarded: true,
            throttling: { usages: 1, duration: 3 }
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        // gets data that will be used later
        const { user: bot, users, guilds, owners } = this.client
        const uptime = Math.trunc(process.uptime() * 1000)
        const options = { long: true, length: 2, showMs: false }

        const info = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${bot.username}'s information`, bot.displayAvatarURL({ dynamic: true }))
            .setDescription(`**>** Join the support server with [this link](https://discord.gg/Pc9pAHf3GU)`)
            .addFields(
                {
                    name: 'info',
                    value: stripIndent`
                        **>** **Version:** v${version}
                        **>** **System:** Node.js ${process.version}
                        **>** **Library:** discord.js-commando v${commandoVersion}
                        **>** **Creator:** ${owners[0].tag}
                    `,
                    inline: true
                },
                {
                    name: 'Statistics',
                    value: stripIndent`
                        **>** **Memory usage:** ${usedMemory}/${maxMemory} MB
                        **>** **Users:** ${users.cache.filter(({ bot }) => !bot).size}
                        **>** **Servers:** ${guilds.cache.size}
                    `,
                    inline: true
                }
            )
            .setFooter(`Uptime: ${ms(uptime, options)}`)
            .setTimestamp()

        message.say(info)
    }
}