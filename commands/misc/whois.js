/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageEmbed, User, GuildMember, UserFlags } = require('discord.js')
const { getKeyPerms, timestamp, replyAll } = require('../../utils/functions')
const ms = require('../../utils/ms')
const { capitalize } = require('lodash')
const { customEmoji } = require('../../utils/format')
/* eslint-enable no-unused-vars */

const userFlags = {
    HOUSE_BRAVERY: '<:bravery:894110822786281532>',
    HOUSE_BRILLIANCE: '<:brilliance:894110822626885663> ',
    HOUSE_BALANCE: '<:balance:894110823553855518>',
    HYPESQUAD_EVENTS: '<:hypesquad:894113047763898369>',
    DISCORD_EMPLOYEE: '<:discord_staff:894115772832546856>',
    PARTNERED_SERVER_OWNER: '<:partner:894116243785785344>',
    BUGHUNTER_LEVEL_1: '<:bug_hunter:894117053714292746>',
    BUGHUNTER_LEVEL_2: '<:bug_buster:894117053856878592>',
    EARLY_SUPPORTER: '<:early_supporter:894117997264896080>',
    EARLY_VERIFIED_BOT_DEVELOPER: '<:verified_developer:894117997378142238>',
    DISCORD_CERTIFIED_MODERATOR: '<:certified_moderator:894118624447586304>',
    VERIFIED_BOT: '<:verified_bot1:894251987087016006><:verified_bot2:894251987661647873>',
    TEAM_USER: '',
}

/** A command that can be run in a client */
module.exports = class WhoIsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'whois',
            aliases: ['user-info', 'userinfo'],
            group: 'misc',
            description: 'Displays a user\'s information.',
            details: '`user` has to be a user\'s username, id or mention.',
            format: 'whois <user>',
            examples: ['whois Pixoll'],
            args: [{
                key: 'user',
                prompt: 'What user do you want to get information from?',
                type: 'user',
                required: false
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'user',
                    description: 'The user to get info from.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get information from
     */
    async run({ message, interaction }, { user }) {
        if (interaction) user = user?.user ?? user ?? interaction.user
        if (message) user ??= message.author
        user = await user.fetch()

        const { guild } = message || interaction

        /** @type {UserFlags} */
        const flags = await user.fetchFlags().catch(() => null)
        /** @type {GuildMember} */
        const member = await guild?.members.fetch(user).catch(() => null)
        const permissions = getKeyPerms(member)

        const description = [user.toString()]
        if (flags) {
            for (const flag of flags) description.push(userFlags[flag])
        }
        if (member?.premiumSince) description.push(customEmoji('boost'))
        if (!flags?.toArray().includes('VERIFIED_BOT') && user.bot) {
            description.push(customEmoji('bot'))
        }

        const avatar = user.displayAvatarURL({ dynamic: true, size: 2048 })

        const userInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }), avatar)
            .setThumbnail(avatar)
            .setDescription(description.join(' '))
            .setFooter(`User id: ${user.id}`)
            .setTimestamp()

        if (member) {
            if (member.presence) {
                for (const { type, name, state, details, url, timestamps } of member.presence.activities) {
                    const status = details && state ? `${details}\n${state}` : details
                    let times = ''
                    if (timestamps) {
                        if (!timestamps.end) times = `Started ${timestamp(timestamps.start, 'R')}`
                        else {
                            times = `${ms(
                                timestamps.end.getTime() - (timestamps.start?.getTime() || Date.now()),
                                { long: true, showAnd: true }
                            )} left`
                        }
                    }

                    if (type === 'CUSTOM' && state) userInfo.addField('Custom status:', state)
                    if (type === 'STREAMING') userInfo.addField(`Streaming ${name}`, url)
                    if (!['COMPETING', 'CUSTOM'].includes(type)) {
                        userInfo.addField(
                            `${capitalize(type)} ${name}`,
                            status ? `${status}\n${times}` : times || '\u200B'
                        )
                    }
                }
            }

            userInfo.addField('Joined', timestamp(member.joinedAt, 'R'), true)
        }

        userInfo.addField('Registered', timestamp(user.createdAt, 'R'), true)

        if (member) {
            const acknowledgement = guild.ownerId === member.id ?
                'Server owner' : permissions === 'Administrator' ? permissions : null
            if (acknowledgement) userInfo.addField('Acknowledgement', acknowledgement, true)
        }

        const banner = user.bannerURL({ dynamic: true, size: 2048 })
        if (banner) {
            userInfo.setImage(banner).addField('Banner', 'Look below:')
        }

        await replyAll({ message, interaction }, userInfo)
    }
}