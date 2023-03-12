"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to time-out?',
        type: 'user',
    }, {
        key: 'duration',
        prompt: 'How long should the time-out last? (max. of 28 days). Set to 0 to remove a timeout.',
        type: ['date', 'duration'],
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
            name: 'time-out',
            aliases: ['timeout'],
            group: 'mod',
            description: 'Set or remove time-out for user so they cannot send messages or join VCs.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`user\` can be either a user's name, mention or ID.
                ${(0, common_tags_1.oneLine) `
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command (max. of 28 days).
                Set to \`0\` to remove a timeout.
                `}
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'timeout [user] [duration] <reason>',
            examples: [
                'timeout Pixoll 2h Excessive swearing',
                'timeout Pixoll 0',
            ],
            clientPermissions: ['ModerateMembers'],
            userPermissions: ['ModerateMembers'],
            guildOnly: true,
            args,
            testAppCommand: true,
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
        const { moderations } = guild.database;
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
        const memberError = (0, utils_1.memberException)(member, mod, this);
        if (memberError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(memberError));
            return;
        }
        const isTimedOut = member.isCommunicationDisabled();
        if (isTimedOut && duration !== 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already timed-out.',
            }));
            return;
        }
        if (!isTimedOut && duration === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been timed-out`,
            fieldValue: (0, common_tags_1.stripIndent) `
            **Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
exports.default = TimeOutCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS1vdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kL3RpbWUtb3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQStCO0FBQy9CLDZDQUFtRDtBQUNuRCxxREFBNkY7QUFDN0YsdUNBU3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxvQ0FBb0M7UUFDNUMsSUFBSSxFQUFFLE1BQU07S0FDZixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixNQUFNLEVBQUUscUZBQXFGO1FBQzdGLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUM7S0FDN0IsRUFBRTtRQUNDLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLHFDQUFxQztRQUM3QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLGtCQUFrQjtLQUM5QixDQUFVLENBQUM7QUFLWixNQUFxQixjQUFlLFNBQVEseUJBQXNCO0lBQzlELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDcEIsS0FBSyxFQUFFLEtBQUs7WUFDWixXQUFXLEVBQUUsMkVBQTJFO1lBQ3hGLG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7a0JBRTFCLElBQUEscUJBQU8sRUFBQTs7O2lCQUdSOzthQUVKO1lBQ0QsTUFBTSxFQUFFLG9DQUFvQztZQUM1QyxRQUFRLEVBQUU7Z0JBQ04sc0NBQXNDO2dCQUN0QyxrQkFBa0I7YUFDckI7WUFDRCxpQkFBaUIsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQ3RDLGVBQWUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQ3BDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFjO1FBQ2xGLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBQSxvQkFBWSxFQUFDLE9BQU8sRUFBRSxJQUFlLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxjQUFjO1lBQUUsT0FBTztRQUM1QixRQUFRLEdBQUcsY0FBYyxDQUFDO1FBQzFCLE1BQU0sS0FBSyxrQkFBa0IsQ0FBQztRQUU5QixNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUN4RCxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUN2QyxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLHNDQUFzQzthQUN0RCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLElBQUEscUJBQWEsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQWUsQ0FBQyxDQUFDO1FBQy9ELElBQUksU0FBUyxFQUFFO1lBQ1gsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE9BQU87U0FDVjtRQUNELE1BQU0sV0FBVyxHQUFHLElBQUEsdUJBQWUsRUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQWUsQ0FBQyxDQUFDO1FBQ2xFLElBQUksV0FBVyxFQUFFO1lBQ2IsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE9BQU87U0FDVjtRQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQ3BELElBQUksVUFBVSxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7WUFDOUIsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLGlDQUFpQzthQUNqRCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxVQUFVLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtZQUMvQixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsbUNBQW1DO2FBQ25ELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsT0FBTyxFQUFFO1lBQzVDLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxXQUFXO1lBQ3JELE1BQU0sRUFBRSxJQUFJO1lBQ1osTUFBTTtTQUNULENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRO1lBQUUsUUFBUSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDNUQsSUFBSSxRQUFRLFlBQVksSUFBSTtZQUFFLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFNUQsTUFBTSxNQUFNLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQUUsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUMzQixNQUFNLEVBQUUsQ0FBQyxJQUFBLGtCQUFVLEVBQUM7d0JBQ2hCLEtBQUssRUFBRSxNQUFNO3dCQUNiLFNBQVMsRUFBRSw4QkFBOEIsS0FBSyxDQUFDLElBQUksRUFBRTt3QkFDckQsVUFBVSxFQUFFLElBQUEseUJBQVcsRUFBQTsrQkFDUixJQUFBLGlCQUFTLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7OEJBQy9CLE1BQU07aUNBQ0gsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxHQUFHO2lCQUMvQztxQkFDSixDQUFDLENBQUM7YUFDTixDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXJCLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsR0FBRSxDQUFDO1FBRW5DLE1BQU0sV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUNsQixHQUFHLEVBQUUsVUFBVTtZQUNmLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxPQUFPO1lBQ2QsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ2YsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2pCLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRTtZQUNoQixNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUc7WUFDbEIsTUFBTTtZQUNOLFFBQVEsRUFBRSxJQUFBLGNBQUUsRUFBQyxRQUFRLEdBQUcsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQy9DLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7WUFDL0IsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLHFCQUFxQjtZQUMzQyxVQUFVLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzJCQUNSLElBQUEsaUJBQVMsRUFBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQzswQkFDL0IsTUFBTTthQUNuQjtTQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBaElELGlDQWdJQyJ9