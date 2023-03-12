"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to warn?',
        type: 'user',
    }, {
        key: 'reason',
        prompt: 'What is the reason of the warn?',
        type: 'string',
        max: 512,
    }];
class warnCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'mod',
            description: 'Warn a member.',
            detailedDescription: '`member` can be a member\'s username, ID or mention. `reason` can be anything you want.',
            format: 'warn [user] [reason]',
            examples: ['warn Pixoll Excessive swearing'],
            modPermissions: true,
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    /**
     * Runs the command
     * @param {CommandContext} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to warn
     * @param {string} args.reason The reason of the warn
     */
    async run(context, { user, reason }) {
        const { guild, guildId, author } = context;
        const member = await guild.members.fetch(user).catch(() => null);
        if (!member) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const userError = (0, utils_1.userException)(user, author, this);
        if (userError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(userError));
            return;
        }
        if (user.bot) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'You can\'t warn a bot.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'warn',
            target: user,
            reason,
        });
        if (!confirmed)
            return;
        await user.send({
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Gold',
                    fieldName: `You have been warned on ${guild.name}`,
                    fieldValue: (0, common_tags_1.stripIndent) `
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
                })],
        }).catch(() => null);
        await guild.database.moderations.add({
            _id: (0, utils_1.generateDocId)(),
            type: 'warn',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
        });
        this.client.emit('guildMemberWarn', guild, author, user, reason);
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been warned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
exports.default = warnCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fybi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvd2Fybi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFBNkY7QUFDN0YsdUNBQWlHO0FBRWpHLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLE1BQU07S0FDZixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsaUNBQWlDO1FBQ3pDLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7S0FDWCxDQUFVLENBQUM7QUFLWixNQUFxQixXQUFZLFNBQVEseUJBQXNCO0lBQzNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxLQUFLO1lBQ1osV0FBVyxFQUFFLGdCQUFnQjtZQUM3QixtQkFBbUIsRUFBRSx5RkFBeUY7WUFDOUcsTUFBTSxFQUFFLHNCQUFzQjtZQUM5QixRQUFRLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQztZQUM1QyxjQUFjLEVBQUUsSUFBSTtZQUNwQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFjO1FBQ3hFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMzQyxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FB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