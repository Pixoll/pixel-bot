/* eslint-disable no-unused-vars */
const { MessageEmbed, User, TextBasedChannel, Message, GuildMember } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
const { noReplyInDMs, basicEmbed } = require('../../utils/functions');
const myMs = require('../../utils/my-ms');
/* eslint-enable no-unused-vars */

/**
 * This module manages reminders.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    const db = client.database.reminders;

    async function sendReminders() {
        const data = await db.fetchMany({ remindAt: { $lte: Date.now() } });
        const { users, channels } = client;

        for (const reminder of data.toJSON()) {
            client.emit('debug', 'Running "modules/reminders#sendReminder".');

            /** @type {User} */
            const user = await users.fetch(reminder.user).catch(() => null);
            if (!user) continue;

            /** @type {TextBasedChannel} */
            const channel = channels.resolve(reminder.channel);
            if (!channel) continue;

            /** @type {GuildMember} */
            let member;
            if (channel.type !== 'DM') {
                member = await channel.guild.members.fetch(user).catch(() => null);
            }

            /** @type {Message} */
            const msg = await channel.messages.fetch(reminder.message).catch(() => null);

            const time = myMs(Date.now() - reminder.createdAt, { long: true, length: 1 });

            const embed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor({
                    name: member?.displayName || user.username, iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(reminder.reminder)
                .setFooter({ text: `Set about ${time} ago` })
                .setTimestamp(reminder.createdAt);

            const options = noReplyInDMs(msg);
            options.embeds = [embed];
            if (msg) {
                options.reply = { messageReference: msg };
                if (msg.author.bot) options.content = user.toString();
            } else if (channel.type !== 'DM') {
                options.content = user.toString();
            }

            await channel.send(options).catch(() => null);
        }

        for (const reminder of data.toJSON()) {
            await db.delete(reminder);
        }

        setTimeout(async () => await sendReminders(), 1000);
    }

    await sendReminders();

    // Cancels the reminders
    client.on('messageReactionAdd', async (reaction, user) => {
        if (reaction.partial) {
            reaction = await reaction.fetch().catch(() => null);
            if (!reaction) return;
        }
        if (user.partial) {
            user = await user.fetch().catch(() => null);
            if (!user) return;
        }

        const { message, emoji } = reaction;
        if (user.bot || emoji.id !== '802617654442852394') return;

        client.emit('debug', 'Running event "modules/reminders#messageReactionAdd".');

        const data = await db.fetch({ user: user.id, message: message.id });
        if (!data) return;

        await user.send({
            embeds: [basicEmbed({
                color: 'GREEN',
                emoji: 'check',
                fieldName: 'Your reminder has been cancelled',
                fieldValue: data.reminder,
            })],
        });

        await db.delete(data);
    });
};
