"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
function percentage(number, total) {
    const chance = (number * 100) / total;
    return Math.round(chance);
}
/** This module manages the chat filter. */
function default_1(client) {
    // Warn - Default chat filter
    client.on('messageCreate', async (message) => {
        if (!message.inGuild())
            return;
        const { guild, author, member, content, mentions, guildId, channel } = message;
        const permissions = member?.permissionsIn(channel).serialize() ?? null;
        if (author.bot || !content || permissions?.Administrator)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'chat-filter');
        if (!isEnabled)
            return;
        const reasons = [];
        if (mentions.everyone && !permissions?.MentionEveryone) {
            reasons.push('Tired to ping everyone.');
        }
        const badWordRegex = new RegExp('bastard|blowjob|boner|boob|buttplug|cock|coon|cum|cunt|dick|dildo|fag|faggot|nigga|nigger|paki|porn|pussy|'
            + 'slut|wank|whores|cum|sex', 'm');
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
        if (reasons.length === 0)
            return;
        const reason = reasons.join(' - ');
        const mod = client.user;
        await message.delete().catch(() => null);
        await guild.database.moderations.add({
            _id: (0, functions_1.docId)(),
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
            embeds: [(0, functions_1.basicEmbed)({
                    color: 'Gold',
                    fieldName: `You have been warned on ${guild.name}`,
                    fieldValue: (0, common_tags_1.stripIndent) `
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
                `,
                })],
        }).catch(() => null);
    });
    // Mute - Spam detector
    client.on('messageCreate', async (message) => {
        if (!message.inGuild())
            return;
        const { guild, guildId, author, member, channel } = message;
        const permissions = member?.permissionsIn(channel).serialize() ?? null;
        if (author.bot || !member || (0, functions_1.parseMessageToCommando)(message)?.isCommand
            || permissions?.Administrator || channel.type === discord_js_1.ChannelType.GuildStageVoice)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'chat-filter');
        if (!isEnabled)
            return;
        const { setup, moderations, active } = guild.database;
        const setupData = await setup.fetch();
        if (!setupData || !setupData.mutedRole)
            return;
        const mutedRole = await guild.roles.fetch(setupData.mutedRole);
        if (!mutedRole)
            return;
        const messages = await channel.messages.fetch().catch(() => null);
        if (!messages)
            return;
        const now = Date.now();
        const filtered = messages.filter(msg => msg.author.id === author.id && (now - msg.createdTimestamp) < 5000);
        if (filtered.size < 5)
            return;
        if (member.roles.cache.has(mutedRole.id))
            return;
        await member.roles.add(mutedRole);
        const reason = 'Spam detection';
        const mod = client.user;
        const duration = now + 60000;
        const id = (0, functions_1.docId)();
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
            embeds: [(0, functions_1.basicEmbed)({
                    color: 'Gold',
                    fieldName: `You have been muted on ${guild.name}`,
                    fieldValue: (0, common_tags_1.stripIndent) `
                **Expires:** ${(0, functions_1.timestamp)(duration, 'R')}
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
                `,
                })],
        }).catch(() => null);
    });
    // Warn - Invite detector
    client.on('messageCreate', async (message) => {
        if (!message.inGuild())
            return;
        const { guild, author, content, guildId, channel, member } = message;
        const permissions = member?.permissionsIn(channel).serialize() ?? null;
        if (author.bot || !member || (0, functions_1.parseMessageToCommando)(message)?.isCommand || !content
            || permissions?.Administrator || channel.type === discord_js_1.ChannelType.GuildStageVoice)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'chat-filter');
        if (!isEnabled)
            return;
        const invites = await guild.invites.fetch().catch(() => null);
        const matches = [...content.matchAll(/discord\.\w+\/(?:invite\/)?([^ ]+)/g)].map(m => m[1]);
        let deleted = false;
        for (const code of matches) {
            if (deleted)
                return;
            const invite = await client.fetchInvite(code).catch(() => null);
            if (!invite || invites?.get(invite.code))
                continue;
            const reason = 'Posted an invite';
            const mod = client.user;
            await message.delete().catch(() => null);
            deleted = true;
            await guild.database.moderations.add({
                _id: (0, functions_1.docId)(),
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
                embeds: [(0, functions_1.basicEmbed)({
                        color: 'Gold',
                        fieldName: `You have been warned on ${guild.name}`,
                        fieldValue: (0, common_tags_1.stripIndent) `
                    **Reason:** ${reason}
                    **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
                    `,
                    })],
            }).catch(() => null);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1maWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9taXNjL2NoYXQtZmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF5QztBQUV6QyxxREFBbUg7QUFFbkgsU0FBUyxVQUFVLENBQUMsTUFBYyxFQUFFLEtBQWE7SUFDN0MsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3RDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsMkNBQTJDO0FBQzNDLG1CQUF5QixNQUE0QjtJQUNqRCw2QkFBNkI7SUFDN0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTztRQUUvQixNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQy9FLE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDO1FBQ3ZFLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUUsYUFBYTtZQUFFLE9BQU87UUFFakUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLGdDQUFvQixFQUFDLEtBQUssRUFBRSxhQUE0QixDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVuQixJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksQ0FBQyxXQUFX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