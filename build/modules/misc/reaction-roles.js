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
        if (!user?.bot)
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
        await member.roles.add(role).catch(() => null);
    });
    client.on('messageReactionRemove', async (partialReaction, partialUser) => {
        const reaction = await (0, utils_1.fetchPartial)(partialReaction);
        if (!reaction)
            return;
        const message = await (0, utils_1.fetchPartial)(reaction.message);
        if (!message?.inGuild())
            return;
        const user = await (0, utils_1.fetchPartial)(partialUser);
        if (!user?.bot)
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
        await member.roles.remove(role).catch(() => null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3Rpb24tcm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9taXNjL3JlYWN0aW9uLXJvbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQWdFO0FBRWhFLHVDQUEyQztBQUUzQywwQ0FBMEM7QUFDM0IsS0FBSyxvQkFBVyxNQUE0QjtJQUN2RCxNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRWhDLE1BQU0sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsRUFBRTtRQUNuRSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxlQUFlLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDdEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO1lBQUUsT0FBTztRQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUc7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLDREQUE0RCxDQUFDLENBQUM7UUFFbkYsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUMzQixNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsS0FBc0IsQ0FBQztRQUNwRSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBRW5CLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxD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