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
        await member.roles.add(mutedRole);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1maWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9taXNjL2NoYXQtZmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF5QztBQUV6Qyx1Q0FBaUg7QUFFakgsU0FBUyxVQUFVLENBQUMsTUFBYyxFQUFFLEtBQWE7SUFDN0MsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3RDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsMkNBQTJDO0FBQzNDLG1CQUF5QixNQUE0QjtJQUNqRCw2QkFBNkI7SUFDN0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTztRQUUvQixNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQy9FLE1BQU0sV0FBVyxHQUFHLE1BQU0sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDO1FBQ3ZFLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUUsYUFBYTtZQUFFLE9BQU87UUFFakUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxhQUE0QixDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQztRQUU3QixJQUFJLFFBQVEsQ0FBQyxRQUFRLElBQUksQ0FBQyxXQUFX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