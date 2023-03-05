"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
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
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'chat-filter');
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
            _id: (0, utils_1.docId)(),
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
            embeds: [(0, utils_1.basicEmbed)({
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
        if (author.bot || !member || (0, utils_1.parseMessageToCommando)(message)?.isCommand
            || permissions?.Administrator || channel.type === discord_js_1.ChannelType.GuildStageVoice)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'chat-filter');
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
        const id = (0, utils_1.docId)();
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
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Gold',
                    fieldName: `You have been muted on ${guild.name}`,
                    fieldValue: (0, common_tags_1.stripIndent) `
                **Expires:** ${(0, utils_1.timestamp)(duration, 'R')}
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
        if (author.bot || !member || (0, utils_1.parseMessageToCommando)(message)?.isCommand || !content
            || permissions?.Administrator || channel.type === discord_js_1.ChannelType.GuildStageVoice)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'chat-filter');
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
                _id: (0, utils_1.docId)(),
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
                embeds: [(0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1maWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9taXNjL2NoYXQtZmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF5QztBQUV6Qyx1Q0FBeUc7QUFFekcsU0FBUyxVQUFVLENBQUMsTUFBYyxFQUFFLEtBQWE7SUFDN0MsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3RDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsMkNBQTJDO0FBQzNDLG1CQUF5QixNQUE0QjtJQUNqRCw2QkFBNkI7SUFDN0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTztRQUUvQixNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQy9FLE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDO1FBQ3ZFLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUUsYUFBYTtZQUFFLE9BQU87UUFFakUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxhQUE0QixDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVuQixJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksQ0FBQyxXQUFX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