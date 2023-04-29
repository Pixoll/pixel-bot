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
            _id: (0, utils_1.generateDocId)(),
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
        await member.roles.add(mutedRole.id);
        const reason = 'Spam detection';
        const mod = client.user;
        const duration = now + 60000;
        const id = (0, utils_1.generateDocId)();
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
                _id: (0, utils_1.generateDocId)(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1maWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9taXNjL2NoYXQtZmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF5QztBQUV6Qyx1Q0FBaUg7QUFFakgsU0FBUyxVQUFVLENBQUMsTUFBYyxFQUFFLEtBQWE7SUFDN0MsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3RDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsMkNBQTJDO0FBQzNDLG1CQUF5QixNQUE0QjtJQUNqRCw2QkFBNkI7SUFDN0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTztRQUUvQixNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQy9FLE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDO1FBQ3ZFLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUUsYUFBYTtZQUFFLE9BQU87UUFFakUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxhQUEwQixDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztRQUU3QixJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksQ0FBQyxXQUFX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