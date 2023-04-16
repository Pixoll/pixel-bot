"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to soft-ban?',
        type: 'user',
    }, {
        key: 'reason',
        prompt: 'What is the reason of the soft-ban?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class SoftBanCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'soft-ban',
            aliases: ['softban'],
            group: 'mod',
            description: 'Soft-ban a user (Ban to delete their messages and then immediately unban).',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`user\` has to be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'soft-ban [user] <reason>',
            examples: [
                'soft-ban Pixoll',
                'soft-ban Pixoll Mass-spam',
            ],
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user, reason }) {
        reason ??= 'No reason given.';
        const { guild, guildId, member: mod, author } = context;
        const { members, bans, database } = guild;
        const userError = (0, utils_1.userException)(user, author, this);
        if (userError) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)(userError));
            return;
        }
        const isBanned = await bans.fetch(user.id).catch(() => null);
        if (isBanned) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already banned.',
            }));
            return;
        }
        const member = await members.fetch(user).catch(() => null);
        const memberError = (0, utils_1.memberException)(member, mod, this);
        if (memberError) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)(memberError));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'soft-ban',
            target: user,
            reason,
        });
        if (!confirmed)
            return;
        if (!user.bot && !!member) {
            const embed = (0, utils_1.basicEmbed)({
                color: 'Gold',
                fieldName: `You have been soft-banned from ${guild.name}`,
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
            await user.send({
                embeds: [embed],
                components: [button],
            }).catch(() => null);
        }
        await members.ban(user, { deleteMessageSeconds: utils_1.sevenDays, reason });
        await members.unban(user, 'Soft-ban.');
        await database.moderations.add({
            _id: (0, utils_1.generateDocId)(),
            type: 'soft-ban',
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
            fieldName: `${user.tag} has been soft-banned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
exports.default = SoftBanCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29mdC1iYW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kL3NvZnQtYmFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUFzRDtBQUN0RCxxREFBNkY7QUFDN0YsdUNBU3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxvQ0FBb0M7UUFDNUMsSUFBSSxFQUFFLE1BQU07S0FDZixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUscUNBQXFDO1FBQzdDLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUsa0JBQWtCO0tBQzlCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGNBQWUsU0FBUSx5QkFBc0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixLQUFLLEVBQUUsS0FBSztZQUNaLFdBQVcsRUFBRSw0RUFBNEU7WUFDekYsbUJBQW1CLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHL0I7WUFDRCxNQUFNLEVBQUUsMEJBQTBCO1lBQ2xDLFFBQVEsRUFBRTtnQkFDTixpQkFBaUI7Z0JBQ2pCLDJCQUEyQjthQUM5QjtZQUNELGlCQUFpQixFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ2pDLGVBQWUsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUMvQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFjO1FBQ3hFLE1BQU0sS0FBSyxrQkFB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