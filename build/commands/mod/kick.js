"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const common_tags_1 = require("common-tags");
const args = [{
        key: 'member',
        prompt: 'What member do you want to kick?',
        type: 'member',
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
            description: 'Kick a member.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`member\` can be either a member's name, mention or ID.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'kick [member] <reason>',
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
    async run(context, { member: passedMember, reason }) {
        reason ??= 'No reason given.';
        const { guild, guildId, member: mod, author } = context;
        const member = await guild.members.fetch(passedMember.id).catch(() => null);
        if (!member) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const { user } = member;
        const userError = (0, utils_1.userException)(user, author, this);
        if (userError) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)(userError));
            return;
        }
        const memberError = (0, utils_1.memberException)(member, mod, this);
        if (memberError) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)(memberError));
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been kicked`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
exports.default = KickCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2ljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qva2ljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUFtSDtBQUNuSCwyQ0FBc0Q7QUFDdEQsdUNBU3FCO0FBQ3JCLDZDQUEwQztBQUUxQyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsa0NBQWtDO1FBQzFDLElBQUksRUFBRSxRQUFRO0tBQ2pCLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxpQ0FBaUM7UUFDekMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxrQkFBa0I7S0FDOUIsQ0FBb0QsQ0FBQztBQUt0RCxNQUFxQixXQUFZLFNBQVEseUJBQXNCO0lBQzNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxLQUFLO1lBQ1osV0FBVyxFQUFFLGdCQUFnQjtZQUM3QixtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUcvQjtZQUNELE1BQU0sRUFBRSx3QkFBd0I7WUFDaEMsUUFBUSxFQUFFO2dCQUNOLGFBQWE7Z0JBQ2Isc0JBQXNCO2FBQ3pCO1lBQ0QsaUJBQWlCLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDbEMsZUFBZSxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQ2hDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFjO1FBQ3hGLE1BQU0sS0FBSyxrQkFBa0IsQ0FBQztRQUM5QixNQUFNLEVBQUUsS0FBSyxF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