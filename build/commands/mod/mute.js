"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to mute?',
        type: 'user',
    }, {
        key: 'duration',
        prompt: 'How long should the mute last?',
        type: ['date', 'duration'],
    }, {
        key: 'reason',
        prompt: 'What is the reason of the mute?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class MuteCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'mod',
            description: 'Mute a user so they cannot send messages or speak.',
            details: (0, common_tags_1.stripIndent) `
                \`user\` can be either a user's name, mention or ID.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'mute [user] [duration] <reason>',
            examples: ['mute Pixoll 2h', 'mute Pixoll 6h Excessive swearing'],
            clientPermissions: ['ManageRoles'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user, duration, reason }) {
        const parsedDuration = await (0, utils_1.parseArgDate)(context, this, 1, duration);
        if (!parsedDuration)
            return;
        duration = parsedDuration;
        reason ??= 'No reason given.';
        const { guild, guildId, member: mod, author } = context;
        const { moderations, active, setup } = guild.database;
        const member = await guild.members.fetch(user).catch(() => null);
        if (!member) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const { roles } = member;
        const data = await setup.fetch();
        if (!data || !data.mutedRole) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.',
            }));
            return;
        }
        const userError = (0, utils_1.userException)(user, author, this);
        if (userError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(userError));
            return;
        }
        const memberError = (0, utils_1.memberException)(member, mod, this);
        if (memberError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(memberError));
            return;
        }
        const role = await guild.roles.fetch(data.mutedRole);
        if (!role) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.',
            }));
            return;
        }
        if (roles.cache.has(role.id)) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already muted.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'mute',
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
        await roles.add(role);
        this.client.emit('guildMemberMute', guild, author, user, reason, duration);
        if (!user.bot)
            await user.send({
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        fieldName: `You have been muted on ${guild.name}`,
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
            type: 'mute',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
            duration: (0, better_ms_1.ms)(duration - now, { long: true }),
        });
        await active.add({
            _id: documentId,
            type: 'mute',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            duration,
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been muted`,
            fieldValue: (0, common_tags_1.stripIndent) `
            **Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
exports.default = MuteCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXV0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2QvbXV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUErQjtBQUMvQiw2Q0FBMEM7QUFDMUMscURBQTZGO0FBQzdGLHVDQVNxQjtBQUVyQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsZ0NBQWdDO1FBQ3hDLElBQUksRUFBRSxNQUFNO0tBQ2YsRUFBRTtRQUNDLEdBQUcsRUFBRSxVQUFVO1FBQ2YsTUFBTSxFQUFFLGdDQUFnQztRQUN4QyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDO0tBQzdCLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxpQ0FBaUM7UUFDekMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxrQkFBa0I7S0FDOUIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsV0FBWSxTQUFRLHlCQUFzQjtJQUMzRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsS0FBSztZQUNaLFdBQVcsRUFBRSxvREFBb0Q7WUFDakUsT0FBTyxFQUFFLElBQUEseUJBQVcsRUFBQTs7OzthQUluQjtZQUNELE1BQU0sRUFBRSxpQ0FBaUM7WUFDekMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsbUNBQW1DLENBQUM7WUFDakUsaUJBQWlCLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDbEMsZUFBZSxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQ2hDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIs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