"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'member',
        prompt: 'What member do you want to time-out?',
        type: 'member',
    }, {
        key: 'duration',
        prompt: 'How long should the time-out last? (max. of 28 days). Set to 0 to remove a timeout.',
        type: ['date', 'duration'],
        async validate(value, message, argument) {
            if (typeof value === 'undefined')
                return false;
            if (parseInt(value) === 0)
                return true;
            return await argument.type?.validate(value, message, argument) ?? true;
        },
        async parse(value, message, argument) {
            if (parseInt(value) === 0)
                return 0;
            return await argument.type?.parse(value, message, argument);
        },
    }, {
        key: 'reason',
        prompt: 'What is the reason of the time-out?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class TimeOutCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'timeout',
            group: 'mod',
            description: 'Set or remove a timeout for a member so they cannot send messages or join VCs.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`member\` can be either a member's name, mention or ID.
                ${(0, common_tags_1.oneLine) `
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command (max. of 28 days).
                Set to \`0\` to remove a timeout.
                `}
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'timeout [member] [duration] <reason>',
            examples: [
                'timeout Pixoll 2h Excessive swearing',
                'timeout Pixoll 0',
            ],
            clientPermissions: ['ModerateMembers'],
            userPermissions: ['ModerateMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { member: passedMember, duration, reason }) {
        const parsedDuration = await (0, utils_1.parseArgDate)(context, this, 1, duration, undefined, 0);
        if (pixoll_commando_1.Util.isNullish(parsedDuration))
            return;
        duration = parsedDuration;
        reason ??= 'No reason given.';
        const { guild, guildId, member: mod, author } = context;
        const { moderations } = guild.database;
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
        const isTimedOut = member.isCommunicationDisabled();
        if (isTimedOut && duration !== 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already timed-out.',
            }));
            return;
        }
        if (!isTimedOut && duration === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user has not been timed-out.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: (isTimedOut ? 'remove' : 'set') + ' time-out',
            target: user,
            reason,
        });
        if (!confirmed)
            return;
        const now = Date.now();
        if (typeof duration === 'number')
            duration = duration + now;
        if (duration instanceof Date)
            duration = duration.getTime();
        await member.disableCommunicationUntil(isTimedOut ? null : duration, reason);
        if (!isTimedOut) {
            this.client.emit('guildMemberTimeout', guild, author, user, reason, duration);
        }
        if (!user.bot)
            await user.send({
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        fieldName: `You have been timed-out on ${guild.name}`,
                        fieldValue: (0, common_tags_1.stripIndent) `
                **Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
                    })],
            }).catch(() => null);
        const documentId = (0, utils_1.generateDocId)();
        await moderations.add({
            _id: documentId,
            type: 'time-out',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
            duration: (0, better_ms_1.ms)(duration - now, { long: true }),
        });
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: isTimedOut
                ? `${user.tag}'s timed-out has been removed`
                : `${user.tag} has been timed-out`,
            fieldValue: (0, common_tags_1.stripIndent) `
            ${!isTimedOut ? `**Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}` : ''}
            **Reason:** ${reason}
            `,
        }));
    }
}
exports.default = TimeOutCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2QvdGltZW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUErQjtBQUMvQiw2Q0FBbUQ7QUFDbkQscURBUXlCO0FBQ3pCLHVDQVNxQjtBQUVyQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO0tBQ2pCLEVBQUU7UUFDQyxHQUFHLEVBQUUsVUFBVTtRQUNmLE1BQU0sRUFBRSxxRkFBcUY7UUFDN0YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztRQUMxQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDL0MsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUN2QyxPQUFPLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDM0UsQ0FBQztRQUNELEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBYSxFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbkUsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFBRSxPQUFPLENBQUMsQ0FBQztZQUNwQyxPQUFPLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQWtCLENBQUM7UUFDakYsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxxQ0FBcUM7UUFDN0MsSUFBSSxF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