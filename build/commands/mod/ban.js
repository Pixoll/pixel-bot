"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to ban?',
        type: 'user',
    }, {
        key: 'reason',
        prompt: 'What is the reason of the ban?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class BanCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'mod',
            description: 'Ban a user permanently.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`user\` has to be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'ban [user] <reason>',
            examples: [
                'ban Pixoll',
                'ban Pixoll The Ban Hammer has Spoken!',
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
            action: 'ban',
            target: user,
            reason,
        });
        if (!confirmed)
            return;
        if (!user.bot && member)
            await user.send({
                embeds: [(0, utils_1.basicEmbed)({
                        color: 'Gold',
                        fieldName: `You have been banned from ${guild.name}`,
                        fieldValue: (0, common_tags_1.stripIndent) `
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
                    })],
            }).catch(() => null);
        await members.ban(user, { deleteMessageSeconds: utils_1.sevenDays, reason });
        await database.moderations.add({
            _id: (0, utils_1.generateDocId)(),
            type: 'ban',
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
            fieldName: `${user.tag} has been banned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
exports.default = BanCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC9iYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMscURBQW1IO0FBQ25ILHVDQUEwSDtBQUUxSCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsK0JBQStCO1FBQ3ZDLElBQUksRUFBRSxNQUFNO0tBQ2YsRUFBRTtRQUNDLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLGdDQUFnQztRQUN4QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLGtCQUFrQjtLQUM5QixDQUFvRCxDQUFDO0FBS3RELE1BQXFCLFVBQVcsU0FBUSx5QkFBc0I7SUFDMUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxLQUFLO1lBQ1gsS0FBSyxFQUFFLEtBQUs7WUFDWixXQUFXLEVBQUUseUJBQXlCO1lBQ3RDLG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7O2FBRy9CO1lBQ0QsTUFBTSxFQUFFLHFCQUFxQjtZQUM3QixRQUFRLEVBQUU7Z0JBQ04sWUFBWTtnQkFDWix1Q0FBdUM7YUFDMUM7WUFDRCxpQkFBaUIsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNqQyxlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBYztRQUN4RSxNQUFNLEtBQUssa0JBQWtCLENBQUM7UUFFOUIsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdB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