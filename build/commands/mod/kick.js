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
            detailedDescription: (0, common_tags_1.stripIndent) `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2ljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qva2ljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUE2RjtBQUM3RiwyQ0FBc0Q7QUFDdEQsdUNBU3FCO0FBQ3JCLDZDQUEwQztBQUUxQyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsZ0NBQWdDO1FBQ3hDLElBQUksRUFBRSxNQUFNO0tBQ2YsRUFBRTtRQUNDLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLGlDQUFpQztRQUN6QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLGtCQUFrQjtLQUM5QixDQUFVLENBQUM7QUFLWixNQUFxQixXQUFZLFNBQVEseUJBQXNCO0lBQzNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxLQUFLO1lBQ1osV0FBVyxFQUFFLGNBQWM7WUFDM0IsbUJBQW1CLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHL0I7WUFDRCxNQUFNLEVBQUUsc0JBQXNCO1lBQzlCLFFBQVEsRUFBRTtnQkFDTixhQUFhO2dCQUNiLHNCQUFzQjthQUN6QjtZQUNELGlCQUFpQixFQUFFLENBQUMsYUFBYSxDQUFDO1lBQ2xDLGVBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUNoQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFjO1FBQ3hFLE1BQU0sS0FBSyxrQkFBa0IsQ0FBQztRQUU5QixNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxN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