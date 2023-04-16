"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/** This module manages reaction roles. */
async function default_1(client) {
    await removeMissingData(client);
    client.on('messageReactionAdd', async (partialReaction, partialUser) => {
        const reaction = await (0, utils_1.fetchPartial)(partialReaction);
        if (!reaction)
            return;
        const message = await (0, utils_1.fetchPartial)(reaction.message);
        if (!message?.inGuild())
            return;
        const user = await (0, utils_1.fetchPartial)(partialUser);
        if (!user || user.bot)
            return;
        client.emit('debug', 'Running event "modules/reaction-roles#messageReactionAdd".');
        const { emoji } = reaction;
        const { roles, members, database } = message.guild;
        const react = emoji.id || emoji.name;
        if (!react)
            return;
        const data = await database.reactionRoles.fetch({ message: message.id });
        if (!data || !data.emojis.includes(react))
            return;
        const i = data.emojis.indexOf(react);
        const role = await roles.fetch(data.roles[i]).catch(() => null);
        const member = await members.fetch(user).catch(() => null);
        if (!member || !role)
            return;
        await member.roles.add(role.id).catch(() => null);
    });
    client.on('messageReactionRemove', async (partialReaction, partialUser) => {
        const reaction = await (0, utils_1.fetchPartial)(partialReaction);
        if (!reaction)
            return;
        const message = await (0, utils_1.fetchPartial)(reaction.message);
        if (!message?.inGuild())
            return;
        const user = await (0, utils_1.fetchPartial)(partialUser);
        if (!user || user.bot)
            return;
        client.emit('debug', 'Running event "modules/reaction-roles#messageReactionRemove".');
        const { emoji } = reaction;
        const { roles, members, database } = message.guild;
        const react = emoji.id || emoji.name;
        if (!react)
            return;
        const data = await database.reactionRoles.fetch({ message: message.id });
        if (!data || !data.emojis.includes(react))
            return;
        const i = data.emojis.indexOf(react);
        const role = await roles.fetch(data.roles[i]).catch(() => null);
        const member = await members.fetch(user).catch(() => null);
        if (!member || !role)
            return;
        await member.roles.remove(role.id).catch(() => null);
    });
}
exports.default = default_1;
/**
 * Loops over every element contained on both arrays and checks wether they have common elements.
 * @param first The first array.
 * @param second The second array.
 */
function findCommonElement(first = [], second = []) {
    for (let i = 0; i < first?.length; i++) {
        for (let j = 0; j < second?.length; j++) {
            if (first[i] === second[j])
                return true;
        }
    }
    return false;
}
async function removeMissingData(client) {
    client.emit('debug', 'Running "modules/reaction-roles#missingData".');
    const guilds = client.guilds.cache.toJSON();
    for (const guild of guilds) {
        const db = guild.database.reactionRoles;
        const data = await db.fetchMany();
        for (const doc of data.toJSON()) {
            await handleMissingData(doc, client, guild);
        }
    }
    setTimeout(async () => await removeMissingData(client), 60 * 60 * 1000);
}
async function handleMissingData(doc, client, guild) {
    const db = guild.database.reactionRoles;
    const channel = client.channels.resolve(doc.channel);
    if (!channel || channel.type === discord_js_1.ChannelType.GuildStageVoice) {
        await db.delete(doc);
        return;
    }
    const message = await channel.messages.fetch(doc.message).catch(() => null);
    const reactions = message?.reactions.cache;
    const commonEmojis = !!findCommonElement(reactions?.map(r => r.emoji.id || r.emoji.name), doc.emojis);
    if (!message || reactions?.size === 0 || !commonEmojis) {
        await db.delete(doc);
        return;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3Rpb24tcm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9taXNjL3JlYWN0aW9uLXJvbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQWdFO0FBRWhFLHVDQUEyQztBQUUzQywwQ0FBMEM7QUFDM0IsS0FBSyxvQkFBVyxNQUE0QjtJQUN2RCxNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRWhDLE1BQU0sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsRUFBRTtRQUNuRSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxlQUFlLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDdEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO1lBQUUsT0FBTztRQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTztRQUU5QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSw0REFBNEQsQ0FBQyxDQUFDO1FBRW5GLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDM0IsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLEtBQWlDLENBQUM7UUFDL0UsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUVuQixNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPO1FBRWxELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJDLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPO1FBRTdCLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsRUFBRTtRQUN0RSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxlQUFlLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDdEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO1lBQUUsT0FBTztRQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTztRQUU5QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSwrREFBK0QsQ0FBQyxDQUFDO1FBRXRGLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDM0IsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLEtBQWlDLENBQUM7UUFDL0UsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUVuQixNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPO1FBRWxELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJDLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPO1FBRTdCLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUF4REQsNEJBd0RDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsaUJBQWlCLENBQUksUUFBYSxFQUFFLEVBQUUsU0FBYyxFQUFFO0lBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7U0FDM0M7S0FDSjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxLQUFLLFVBQVUsaUJBQWlCLENBQUMsTUFBNEI7SUFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsK0NBQStDLENBQUMsQ0FBQztJQUV0RSxNQUFNLE1BQU0sR0FBSSxNQUFNLENBQUMsTUFBMEMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDakYsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDeEIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7UUFFeEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDN0IsTUFBTSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQy9DO0tBQ0o7SUFFRCxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQUVELEtBQUssVUFBVSxpQkFBaUIsQ0FDNUIsR0FBc0MsRUFBRSxNQUE0QixFQUFFLEtBQW9CO0lBRTFGLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO0lBQ3hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQWlDLENBQUM7SUFDckYsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsZUFBZSxFQUFFO1FBQzFELE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQixPQUFPO0tBQ1Y7SUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUUsTUFBTSxTQUFTLEdBQUcsT0FBTyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUM7SUFDM0MsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUNwQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUM5RCxDQUFDO0lBRUYsSUFBSSxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQUUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtRQUNwRCxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsT0FBTztLQUNWO0FBQ0wsQ0FBQyJ9