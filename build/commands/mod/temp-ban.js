"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to ban?',
        type: 'user',
    }, {
        key: 'duration',
        prompt: 'How long should the ban last?',
        type: ['date', 'duration'],
    }, {
        key: 'reason',
        prompt: 'What is the reason of the ban?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class TempBanCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'temp-ban',
            aliases: ['tempban'],
            group: 'mod',
            description: 'Ban a user for a specified amount of time.',
            details: (0, common_tags_1.stripIndent) `
                \`user\` has to be a user's username, ID or mention.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'temp-ban [user] [duration] <reason>',
            examples: [
                'temp-ban Pixoll 1d',
                'temp-ban Pixoll 30d Advertising in DM\'s',
            ],
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
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
        const { members, bans, database } = guild;
        const { moderations, active } = database;
        const userError = (0, utils_1.userException)(user, author, this);
        if (userError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(userError));
            return;
        }
        const isBanned = await bans.fetch(user).catch(() => null);
        if (isBanned) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already banned.',
            }));
            return;
        }
        const member = await members.fetch(user).catch(() => null);
        const memberError = (0, utils_1.memberException)(member, mod, this);
        if (memberError) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)(memberError));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'temp-ban',
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
        if (!user.bot && member) {
            const embed = (0, utils_1.basicEmbed)({
                color: 'Gold',
                fieldName: `You have been temp-banned from ${guild.name}`,
                fieldValue: (0, common_tags_1.stripIndent) `
                **Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}

                *The invite will expire in 1 week.*
                `,
            });
            const channel = guild.channels.cache.find(c => c.type === discord_js_1.ChannelType.GuildText);
            const button = (0, utils_1.inviteButton)(await channel.createInvite({
                maxAge: 0,
                maxUses: 1,
            }));
            await user.send({
                embeds: [embed],
                components: [button],
            }).catch(() => null);
        }
        await members.ban(user, { deleteMessageSeconds: utils_1.sevenDays, reason });
        const documentId = (0, utils_1.generateDocId)();
        await moderations.add({
            _id: documentId,
            type: 'temp-ban',
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
            type: 'temp-ban',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            duration,
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been banned`,
            fieldValue: (0, common_tags_1.stripIndent) `
            **Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
exports.default = TempBanCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcC1iYW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kL3RlbXAtYmFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQStCO0FBQy9CLDZDQUEwQztBQUMxQywyQ0FBc0Q7QUFDdEQscURBQTZGO0FBQzdGLHVDQVdxQjtBQUVyQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsK0JBQStCO1FBQ3ZDLElBQUksRUFBRSxNQUFNO0tBQ2YsRUFBRTtRQUNDLEdBQUcsRUFBRSxVQUFVO1FBQ2YsTUFBTSxFQUFFLCtCQUErQjtRQUN2QyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDO0tBQzdCLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxrQkFBa0I7S0FDOUIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsY0FBZSxTQUFRLHlCQUFzQjtJQUM5RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDO1lBQ3BCLEtBQUssRUFBRSxLQUFLO1lBQ1osV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxPQUFPLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7O2FBSW5CO1lBQ0QsTUFBTSxFQUFFLHFDQUFxQztZQUM3QyxRQUFRLEVBQUU7Z0JBQ04sb0JBQW9CO2dCQUNwQiwwQ0FBMEM7YUFDN0M7WUFDRCxpQkFBaUIsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNqQyxlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtT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