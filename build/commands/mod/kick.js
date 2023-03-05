"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const common_tags_1 = require("common-tags");
const args = [{
        key: 'user',
        prompt: 'What user do you want to kick?',
        type: 'user',
    }, {
        key: 'reason',
        prompt: 'What is the reason of the kick?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class KickCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'mod',
            description: 'Kick a user.',
            details: (0, common_tags_1.stripIndent) `
                \`user\` can be either a user's name, mention or ID.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'kick [user] <reason>',
            examples: [
                'kick Pixoll',
                'kick Pixoll Get out!',
            ],
            clientPermissions: ['KickMembers'],
            userPermissions: ['KickMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user, reason }) {
        reason ??= 'No reason given.';
        const { guild, guildId, member: mod, author } = context;
        const userError = (0, utils_1.userException)(user, author, this);
        if (userError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(userError));
            return;
        }
        const member = await guild.members.fetch(user).catch(() => null);
        if (!member) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const memberError = (0, utils_1.memberException)(member, mod, this);
        if (memberError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(memberError));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'kick',
            target: user,
            reason,
        });
        if (!confirmed)
            return;
        if (!user.bot) {
            const embed = (0, utils_1.basicEmbed)({
                color: 'Gold',
                fieldName: `You have been kicked from ${guild.name}`,
                fieldValue: (0, common_tags_1.stripIndent) `
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()} ${author.tag}

                    *The invite will expire in 1 week.*
                `,
            });
            const channel = guild.channels.cache.find(c => c.type === discord_js_1.ChannelType.GuildText);
            const button = (0, utils_1.inviteButton)(await channel.createInvite({
                maxAge: utils_1.sevenDays,
                maxUses: 1,
            }));
            await user.send({ embeds: [embed], components: [button] }).catch(() => null);
        }
        await guild.members.kick(user, reason);
        await guild.database.moderations.add({
            _id: (0, utils_1.generateDocId)(),
            type: 'kick',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been kicked`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
exports.default = KickCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2ljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qva2ljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUE2RjtBQUM3RiwyQ0FBc0Q7QUFDdEQsdUNBU3FCO0FBQ3JCLDZDQUEwQztBQUUxQyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsZ0NBQWdDO1FBQ3hDLElBQUksRUFBRSxNQUFNO0tBQ2YsRUFBRTtRQUNDLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLGlDQUFpQztRQUN6QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLGtCQUFrQjtLQUM5QixDQUFVLENBQUM7QUFLWixNQUFxQixXQUFZLFNBQVEseUJBQXNCO0lBQzNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxLQUFLO1lBQ1osV0FBVyxFQUFFLGNBQWM7WUFDM0IsT0FBTyxFQUFFLElBQUEseUJBQVcsRUFBQTs7O2FBR25CO1lBQ0QsTUFBTSxFQUFFLHNCQUFzQjtZQUM5QixRQUFRLEVBQUU7Z0JBQ04sYUFBYTtnQkFDYixzQkFBc0I7YUFDekI7WUFDRCxpQkFBaUIsRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUNsQyxlQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDaEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBYztRQUN4RSxNQUFNLEtBQUssa0JBQWtCLENBQUM7UUFFOUIsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFB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