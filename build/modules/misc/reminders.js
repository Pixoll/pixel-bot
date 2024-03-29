"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
/** This module manages reminders. */
async function default_1(client) {
    const db = client.database.reminders;
    await sendReminders(client, db);
    // Cancels the reminders
    client.on('messageReactionAdd', async (partialReaction, partialUser) => {
        const reaction = await (0, utils_1.fetchPartial)(partialReaction);
        if (!reaction)
            return;
        const user = await (0, utils_1.fetchPartial)(partialUser);
        if (!user || user.bot)
            return;
        const { message, emoji } = reaction;
        if (user.bot || emoji.id !== '802617654442852394')
            return;
        client.emit('debug', 'Running event "modules/reminders#messageReactionAdd".');
        const data = await db.fetch({ user: user.id, message: message.id });
        if (!data)
            return;
        await user.send({
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    fieldName: 'Your reminder has been cancelled',
                    fieldValue: (0, common_tags_1.stripIndent) `
                    ${data.reminder}
                    ${(0, utils_1.hyperlink)('Jump to message', data.msgURL)}
                `,
                })],
        });
        await db.delete(data);
    });
}
exports.default = default_1;
async function sendReminders(client, db) {
    const data = await db.fetchMany({ remindAt: { $lte: Date.now() } });
    const { users, channels } = client;
    for (const reminder of data.toJSON()) {
        client.emit('debug', 'Running "modules/reminders#sendReminder".');
        const user = await users.fetch(reminder.user).catch(() => null);
        if (!user)
            continue;
        const channel = channels.resolve(reminder.channel);
        if (!channel || channel.type === discord_js_1.ChannelType.GuildStageVoice)
            continue;
        const member = !channel.isDMBased()
            ? await channel.guild.members.fetch(user).catch(() => null)
            : null;
        const msg = await channel.messages.fetch(reminder.message).catch(() => null);
        const time = (0, better_ms_1.prettyMs)(Date.now() - reminder.createdAt.valueOf(), { verbose: true, unitCount: 1 });
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: member?.displayName || user.username,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(reminder.reminder)
            .setFooter({ text: `Set about ${time} ago` })
            .setTimestamp(reminder.createdAt);
        const options = {
            embeds: [embed],
            ...msg && {
                reply: { messageReference: msg },
                ...pixoll_commando_1.Util.noReplyPingInDMs(msg),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbWlzYy9yZW1pbmRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQTBDO0FBQzFDLDJDQUErRjtBQUMvRixxREFBd0Y7QUFDeEYsdUNBQThFO0FBRTlFLHFDQUFxQztBQUN0QixLQUFLLG9CQUFXLE1BQTRCO0lBQ3ZELE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO0lBRXJDLE1BQU0sYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVoQyx3QkFBd0I7SUFDeEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxFQUFFO1FBQ25FLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSxvQkFBWSxFQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUN0QixNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTztRQUU5QixNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUNwQyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxvQkFBb0I7WUFBRSxPQUFPO1FBRTFELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHVEQUF1RCxDQUFDLENBQUM7UUFFOUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFD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