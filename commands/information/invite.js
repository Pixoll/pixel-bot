const { MessageEmbed } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')

module.exports = class invite extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            group: 'info',
            memberName: 'invite',
            description: 'Invite this bot to your server.',
            guarded: true
        })
    }

    onBlock() { return }
    onError() { return }

    /**
    * @param {CommandoMessage} message The message
    */
    run(message) {
        const link = `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=applications.commands%20bot`

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setDescription(`Invite the bot using [this link](${link}).`)

        message.say(embed)
    }
}