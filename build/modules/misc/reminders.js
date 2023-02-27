"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const better_ms_1 = require("better-ms");
/** This module manages reminders. */
async function default_1(client) {
    const db = client.database.reminders;
    await sendReminders(client, db);
    // Cancels the reminders
    client.on('messageReactionAdd', async (partialReaction, partialUser) => {
        const reaction = await (0, functions_1.fetchPartial)(partialReaction);
        if (!reaction)
            return;
        const user = await (0, functions_1.fetchPartial)(partialUser);
        if (!user?.bot)
            return;
        const { message, emoji } = reaction;
        if (user.bot || emoji.id !== '802617654442852394')
            return;
        client.emit('debug', 'Running event "modules/reminders#messageReactionAdd".');
        const data = await db.fetch({ user: user.id, message: message.id });
        if (!data)
            return;
        await user.send({
            embeds: [(0, functions_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    fieldName: 'Your reminder has been cancelled',
                    fieldValue: data.reminder,
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
            .setColor('#4c9f4c')
            .setAuthor({
            name: member?.displayName || user.username, iconURL: user.displayAvatarURL({ forceStatic: false }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbWlzYy9yZW1pbmRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBK0Y7QUFDL0YscURBQXdGO0FBQ3hGLHFEQUFpRTtBQUNqRSx5Q0FBcUM7QUFFckMscUNBQXFDO0FBQ3RCLEtBQUssb0JBQVcsTUFBNEI7SUFDdkQsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7SUFFckMsTUFBTSxhQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRWhDLHdCQUF3QjtJQUN4QixNQUFNLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLEVBQUU7UUFDbkUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLHdCQUFZLEVBQUMsZUFBZSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPO1FBQ3RCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx3QkFBWSxFQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRztZQUFFLE9BQU87UUFFdkIsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDcEMsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssb0JBQW9CO1lBQUUsT0FBTztRQUUxRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1REFBdUQsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU87UUFFbEIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ1osTUFBTSxFQUFFLENBQUMsSUFBQSxzQkFBVSxFQUFDO29CQUNoQixLQUFLLEVBQUUsT0FBTztvQkFDZCxLQUFLLEVBQUUsT0FBTztvQkFDZCxTQUFTLEVBQUUsa0NBQWtDO29CQUM3QyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVE7aUJBQzVCLENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQztRQUVILE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUEvQkQsNEJBK0JDO0FBRUQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxNQUE0QixFQUFFLEVBQW1DO0lBQzFGLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDcEUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFFbkMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztRQUVsRSxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsSUFBSTtZQUFFLFNBQVM7UUFFcEIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUE0QixDQUFDO1FBQzlFLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLGVBQWU7WUFBRSxTQUFTO1FBRXZFLE1BQU0sTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUMvQixDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztZQUMzRCxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRVgsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdFLE1BQU0sSUFBSSxHQUFHLElBQUEsb0JBQVEsRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFbEcsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3JHLENBQUM7YUFDRCxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzthQUNqQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsYUFBYSxJQUFJLE1BQU0sRUFBRSxDQUFDO2FBQzVDLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdEMsTUFBTSxPQUFPLEdBQXlCO1lBQ2xDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNmLEdBQUcsR0FBRyxJQUFJO2dCQUNOLEtBQUssRUFBRSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtnQkFDaEMsR0FBRyxzQkFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztnQkFDN0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSTtvQkFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7aUJBQzNCO2FBQ0o7WUFDRCxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJO2dCQUN2QixPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTthQUMzQjtTQUNKLENBQUM7UUFFRixNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDbEMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzdCO0lBRUQsVUFBVSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsTUFBTSxhQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xFLENBQUMifQ==