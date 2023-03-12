"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'role',
        prompt: 'What role would you want to give then?',
        type: 'role',
        async validate(value, message, argument) {
            if (typeof value === 'undefined')
                return false;
            const isValid = await argument.type?.validate(value, message, argument) ?? true;
            if (isValid !== true)
                return isValid;
            const role = await argument.type?.parse(value, message, argument);
            return (0, utils_1.isValidRole)(message, role);
        },
    }, {
        key: 'user',
        prompt: 'What user do you want to give the role?',
        type: 'user',
    }, {
        key: 'duration',
        prompt: 'How long should this role last?',
        type: ['date', 'duration'],
    }, {
        key: 'reason',
        prompt: 'Why are you\'re giving them the role?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class TempRoleCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'temp-role',
            aliases: ['temprole'],
            group: 'mod',
            description: 'Assign a role that persists for a limited time.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`role\` can be either a role's name, mention or ID.
                \`user\` can be either a user's name, mention or ID.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'temp-role [role] [user] [duration] <reason>',
            examples: ['temp-role Moderator Pixoll 1d'],
            clientPermissions: ['ManageRoles'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user, duration, role, reason }) {
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
        if (!(0, utils_1.isValidRole)(context, role)) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That is not a valid manageable role.',
            }));
            return;
        }
        const { roles } = member;
        const parsedDuration = await (0, utils_1.parseArgDate)(context, this, 2, duration);
        if (!parsedDuration)
            return;
        duration = parsedDuration;
        reason ??= 'No reason given.';
        if (typeof duration === 'number')
            duration = duration + Date.now();
        if (duration instanceof Date)
            duration = duration.getTime();
        if (roles.cache.has(role.id)) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That member already has that role.',
            }));
            return;
        }
        await roles.add(role, reason);
        if (!user.bot)
            await user.send({
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        fieldName: `You have been given the \`${role.name}\` role on ${guild.name}`,
                        fieldValue: (0, common_tags_1.stripIndent) `
                **Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
                    })],
            }).catch(() => null);
        await guild.database.active.add({
            _id: (0, utils_1.generateDocId)(),
            type: 'temp-role',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            role: role.id,
            duration,
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Added role \`${role.name}\` to ${user.tag}`,
            fieldValue: (0, common_tags_1.stripIndent) `
            **Expires:** ${(0, utils_1.timestamp)(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
exports.default = TempRoleCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcC1yb2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC90ZW1wLXJvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMscURBUXlCO0FBQ3pCLHVDQUF3RztBQUV4RyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsd0NBQXdDO1FBQ2hELElBQUksRUFBRSxNQUFNO1FBQ1osS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQy9DLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDaEYsSUFBSSxPQUFPLEtBQUssSUFBSTtnQkFBRSxPQUFPLE9BQU8sQ0FBQztZQUNyQyxNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUE2QixDQUFDO1lBQzlGLE9BQU8sSUFBQSxtQkFBVyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLHlDQUF5QztRQUNqRCxJQUFJLEVBQUUsTUFBTTtLQUNmLEVBQUU7UUFDQyxHQUFHLEVBQUUsVUFBVTtRQUNmLE1BQU0sRUFBRSxpQ0FBaUM7UUFDekMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztLQUM3QixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsdUNBQXVDO1FBQy9DLElBQUksRUFBRSxR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