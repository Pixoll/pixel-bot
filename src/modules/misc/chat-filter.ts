import { stripIndent } from 'common-tags';
import { ChannelType } from 'discord.js';
import { CommandoClient, GuildModule } from 'pixoll-commando';
import { isGuildModuleEnabled, basicEmbed, generateDocId, timestamp, parseMessageToCommando } from '../../utils';

function percentage(number: number, total: number): number {
    const chance = (number * 100) / total;
    return Math.round(chance);
}

/** This module manages the chat filter. */
export default function (client: CommandoClient<true>): void {
    // Warn - Default chat filter
    client.on('messageCreate', async message => {
        if (!message.inGuild()) return;

        const { guild, author, member, content, mentions, guildId, channel } = message;
        const permissions = member?.permissionsIn(channel).serialize() ?? null;
        if (author.bot || !content || permissions?.Administrator) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'chat-filter' as GuildModule);
        if (!isEnabled) return;

        const reasons = [];

        if (mentions.everyone && !permissions?.MentionEveryone) {
            reasons.push('Tired to ping everyone.');
        }

        const badWordRegex = new RegExp(
            'bastard|blowjob|boner|boob|buttplug|cock|coon|cum|cunt|dick|dildo|fag|faggot|nigga|nigger|paki|porn|pussy|'
            + 'slut|wank|whores|cum|sex',
            'm'
        );

        if (badWordRegex.test(content)) {
            reasons.push('Use of at least 1 blacklisted word.');
        }

        if (content.length > 50) {
            const uppercase = content.replace(/[^A-Z]/g, '');
            const moreThan80 = percentage(uppercase.length, content.length) > 80;
            if (moreThan80) {
                reasons.push('More than 80% of the message is in uppercase.');
            }
        }

        const totalMentions = mentions.users.size + mentions.roles.size;
        if (totalMentions > 10) {
            reasons.push('Mentioned more than 10 users/roles at once.');
        }

        if (/%CC%/g.test(encodeURIComponent(message.content))) {
            reasons.push('Usage of zalgo text.');
        }

        if (reasons.length === 0) return;

        const reason = reasons.join(' - ');
        const mod = client.user;

        await message.delete().catch(() => null);
        await guild.database.moderations.add({
            _id: generateDocId(),
            type: 'warn',
            guild: guildId,
            userId: author.id,
            userTag: author.tag,
            modId: mod.id,
            modTag: mod.tag,
            reason,
        });
        client.emit('guildMemberWarn', guild, mod, author, reason);

        await author.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been warned on ${guild.name}`,
                fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
                `,
            })],
        }).catch(() => null);
    });

    // Mute - Spam detector
    client.on('messageCreate', async message => {
        if (!message.inGuild()) return;

        const { guild, guildId, author, member, channel } = message;
        const permissions = member?.permissionsIn(channel).serialize() ?? null;
        if (
            author.bot || !member || parseMessageToCommando(message)?.isCommand
            || permissions?.Administrator || channel.type === ChannelType.GuildStageVoice
        ) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'chat-filter' as GuildModule);
        if (!isEnabled) return;

        const { setup, moderations, active } = guild.database;

        const setupData = await setup.fetch();
        if (!setupData || !setupData.mutedRole) return;

        const mutedRole = await guild.roles.fetch(setupData.mutedRole);
        if (!mutedRole) return;

        const messages = await channel.messages.fetch().catch(() => null);
        if (!messages) return;

        const now = Date.now();
        const filtered = messages.filter(msg => msg.author.id === author.id && (now - msg.createdTimestamp) < 5000);
        if (filtered.size < 5) return;

        if (member.roles.cache.has(mutedRole.id)) return;
        await member.roles.add(mutedRole);

        const reason = 'Spam detection';
        const mod = client.user;
        const duration = now + 60_000;
        const id = generateDocId();

        await moderations.add({
            _id: id,
            type: 'mute',
            guild: guildId,
            userId: author.id,
            userTag: author.tag,
            modId: mod.id,
            modTag: mod.tag,
            reason,
            duration: '1 minute',
        });
        await active.add({
            _id: id,
            type: 'mute',
            guild: guildId,
            userId: author.id,
            userTag: author.tag,
            duration,
        });

        await author.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been muted on ${guild.name}`,
                fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
                `,
            })],
        }).catch(() => null);
    });

    // Warn - Invite detector
    client.on('messageCreate', async message => {
        if (!message.inGuild()) return;

        const { guild, author, content, guildId, channel, member } = message;
        const permissions = member?.permissionsIn(channel).serialize() ?? null;
        if (
            author.bot || !member || parseMessageToCommando(message)?.isCommand || !content
            || permissions?.Administrator || channel.type === ChannelType.GuildStageVoice
        ) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'chat-filter' as GuildModule);
        if (!isEnabled) return;

        const invites = await guild.invites.fetch().catch(() => null);
        const matches = [...content.matchAll(/discord\.\w+\/(?:invite\/)?([^ ]+)/g)].map(m => m[1]);

        let deleted = false;
        for (const code of matches) {
            if (deleted) return;

            const invite = await client.fetchInvite(code).catch(() => null);
            if (!invite || invites?.get(invite.code)) continue;

            const reason = 'Posted an invite';
            const mod = client.user;

            await message.delete().catch(() => null);
            deleted = true;
            await guild.database.moderations.add({
                _id: generateDocId(),
                type: 'warn',
                guild: guildId,
                userId: author.id,
                userTag: author.tag,
                modId: mod.id,
                modTag: mod.tag,
                reason,
            });
            client.emit('guildMemberWarn', guild, mod, author, reason);

            await author.send({
                embeds: [basicEmbed({
                    color: 'Gold',
                    fieldName: `You have been warned on ${guild.name}`,
                    fieldValue: stripIndent`
                    **Reason:** ${reason}
                    **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
                    `,
                })],
            }).catch(() => null);
        }
    });
}
