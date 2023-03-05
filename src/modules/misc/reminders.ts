import { prettyMs } from 'better-ms';
import { stripIndent } from 'common-tags';
import { EmbedBuilder, TextBasedChannel, ChannelType, MessageCreateOptions } from 'discord.js';
import { CommandoClient, DatabaseManager, ReminderSchema, Util } from 'pixoll-commando';
import { basicEmbed, fetchPartial, hyperlink } from '../../utils';

/** This module manages reminders. */
export default async function (client: CommandoClient<true>): Promise<void> {
    const db = client.database.reminders;

    await sendReminders(client, db);

    // Cancels the reminders
    client.on('messageReactionAdd', async (partialReaction, partialUser) => {
        const reaction = await fetchPartial(partialReaction);
        if (!reaction) return;
        const user = await fetchPartial(partialUser);
        if (!user || user.bot) return;

        const { message, emoji } = reaction;
        if (user.bot || emoji.id !== '802617654442852394') return;

        client.emit('debug', 'Running event "modules/reminders#messageReactionAdd".');

        const data = await db.fetch({ user: user.id, message: message.id });
        if (!data) return;

        await user.send({
            embeds: [basicEmbed({
                color: 'Green',
                emoji: 'check',
                fieldName: 'Your reminder has been cancelled',
                fieldValue: stripIndent`
                    ${data.reminder}
                    ${hyperlink('Jump to message', data.msgURL)}
                `,
            })],
        });

        await db.delete(data);
    });
}

async function sendReminders(client: CommandoClient<true>, db: DatabaseManager<ReminderSchema>): Promise<void> {
    const data = await db.fetchMany({ remindAt: { $lte: Date.now() } });
    const { users, channels } = client;

    for (const reminder of data.toJSON()) {
        client.emit('debug', 'Running "modules/reminders#sendReminder".');

        const user = await users.fetch(reminder.user).catch(() => null);
        if (!user) continue;

        const channel = channels.resolve(reminder.channel) as TextBasedChannel | null;
        if (!channel || channel.type === ChannelType.GuildStageVoice) continue;

        const member = !channel.isDMBased()
            ? await channel.guild.members.fetch(user).catch(() => null)
            : null;

        const msg = await channel.messages.fetch(reminder.message).catch(() => null);

        const time = prettyMs(Date.now() - reminder.createdAt.valueOf(), { verbose: true, unitCount: 1 });

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: member?.displayName || user.username, iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(reminder.reminder)
            .setFooter({ text: `Set about ${time} ago` })
            .setTimestamp(reminder.createdAt);

        const options: MessageCreateOptions = {
            embeds: [embed],
            ...msg && {
                reply: { messageReference: msg },
                ...Util.noReplyPingInDMs(msg),
                ...msg.author.bot && {
                    content: user.toString(),
                },
            },
            ...!channel.isDMBased() && {
                content: user.toString(),
            },
        };

        await channel.send(options).catch(() => null);
    }

    for (const reminder of data.toJSON()) {
        await db.delete(reminder);
    }

    setTimeout(async () => await sendReminders(client, db), 1000);
}
