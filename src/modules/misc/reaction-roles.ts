import { GuildTextBasedChannel, ChannelType } from 'discord.js';
import { CommandoClient, CommandoGuild, ReactionRoleSchema } from 'pixoll-commando';
import { fetchPartial } from '../../utils';

/** This module manages reaction roles. */
export default async function (client: CommandoClient<true>): Promise<void> {
    await removeMissingData(client);

    client.on('messageReactionAdd', async (partialReaction, partialUser) => {
        const reaction = await fetchPartial(partialReaction);
        if (!reaction) return;
        const message = await fetchPartial(reaction.message);
        if (!message?.inGuild()) return;
        const user = await fetchPartial(partialUser);
        if (!user || user.bot) return;

        client.emit('debug', 'Running event "modules/reaction-roles#messageReactionAdd".');

        const { emoji } = reaction;
        const { roles, members, database } = message.guild as CommandoGuild;
        const react = emoji.id || emoji.name;
        if (!react) return;

        const data = await database.reactionRoles.fetch({ message: message.id });
        if (!data || !data.emojis.includes(react)) return;

        const i = data.emojis.indexOf(react);

        const role = await roles.fetch(data.roles[i]).catch(() => null);
        const member = await members.fetch(user).catch(() => null);
        if (!member || !role) return;

        await member.roles.add(role).catch(() => null);
    });

    client.on('messageReactionRemove', async (partialReaction, partialUser) => {
        const reaction = await fetchPartial(partialReaction);
        if (!reaction) return;
        const message = await fetchPartial(reaction.message);
        if (!message?.inGuild()) return;
        const user = await fetchPartial(partialUser);
        if (!user || user.bot) return;

        client.emit('debug', 'Running event "modules/reaction-roles#messageReactionRemove".');

        const { emoji } = reaction;
        const { roles, members, database } = message.guild as CommandoGuild;
        const react = emoji.id || emoji.name;
        if (!react) return;

        const data = await database.reactionRoles.fetch({ message: message.id });
        if (!data || !data.emojis.includes(react)) return;

        const i = data.emojis.indexOf(react);

        const role = await roles.fetch(data.roles[i]).catch(() => null);
        const member = await members.fetch(user).catch(() => null);
        if (!member || !role) return;

        await member.roles.remove(role).catch(() => null);
    });
}

/**
 * Loops over every element contained on both arrays and checks wether they have common elements.
 * @param first The first array.
 * @param second The second array.
 */
function findCommonElement<T>(first: T[] = [], second: T[] = []): boolean {
    for (let i = 0; i < first?.length; i++) {
        for (let j = 0; j < second?.length; j++) {
            if (first[i] === second[j]) return true;
        }
    }
    return false;
}

async function removeMissingData(client: CommandoClient<true>): Promise<void> {
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

async function handleMissingData(
    doc: ReactionRoleSchema, client: CommandoClient<true>, guild: CommandoGuild
): Promise<void> {
    const db = guild.database.reactionRoles;
    const channel = client.channels.resolve(doc.channel) as GuildTextBasedChannel | null;
    if (!channel || channel.type === ChannelType.GuildStageVoice) {
        await db.delete(doc);
        return;
    }

    const message = await channel.messages.fetch(doc.message).catch(() => null);
    const reactions = message?.reactions.cache;
    const commonEmojis = !!findCommonElement(
        reactions?.map(r => r.emoji.id || r.emoji.name), doc.emojis
    );

    if (!message || reactions?.size === 0 || !commonEmojis) {
        await db.delete(doc);
        return;
    }
}
