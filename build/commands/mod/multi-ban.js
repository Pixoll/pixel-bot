"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const usersAmount = 10;
const args = [{
        key: 'reason',
        prompt: 'What is the reason of the ban?',
        type: 'string',
        max: 512,
    }, {
        key: 'users',
        prompt: 'What users do you want to ban?',
        type: 'string',
        async validate(value, message, argument) {
            const type = message.client.registry.types.get('user');
            const queries = value?.split(/\s*,\s*/).slice(0, usersAmount) ?? [];
            const valid = [];
            for (const query of queries) {
                const isValid1 = await type.validate(query, message, argument);
                if (!isValid1)
                    valid.push(false);
                const user = await type.parse(query, message, argument);
                const isValid2 = await isValidMember(message, user);
                valid.push(isValid2);
            }
            return valid.filter(b => b === true).length === 0;
        },
        error: 'None of the members you specified were valid. Please try again.',
    }];
class MultiBanCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'multi-ban',
            aliases: ['massban', 'multiban', 'mass-ban'],
            group: 'mod',
            description: `Ban multiple members at the same time (max. ${usersAmount} at once).`,
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`reason\` **has** to be surrounded by quotes.
                \`members\` to be all the members' names, mentions or ids, separated by commas (max. ${usersAmount} at once).
            `,
            format: 'multi-ban "[reason]" [members]',
            examples: ['multi-ban "Raid" Pixoll, 801615120027222016'],
            clientPermissions: ['BanMembers'],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'reason',
                    description: 'The reason of the multi-ban.',
                    required: true,
                }, ...(0, utils_1.arrayWithLength)(usersAmount, (n) => ({
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    name: `user-${n}`,
                    description: `The ${(0, utils_1.addOrdinalSuffix)(n)} user.`,
                    required: n === 1,
                }))],
        });
    }
    async run(context, args) {
        const { guild, guildId, author } = context;
        const { reason } = args;
        const message = await (0, utils_1.getContextMessage)(context);
        const users = await parseUsers(context, args, message, this);
        const manager = guild.members;
        const embed = (n) => (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: `Banned ${n}/${users.length} members...`,
        });
        const replyToEdit = await (0, utils_1.reply)(context, embed(0));
        const banned = [];
        for (const user of users) {
            const confirmed = await (0, utils_1.confirmButtons)(context, {
                action: 'ban',
                target: user,
                reason,
                sendCancelled: false,
            });
            if (!confirmed)
                continue;
            if (!user.bot)
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
            await manager.ban(user, { deleteMessageSeconds: utils_1.sevenDays, reason });
            await guild.database.moderations.add({
                _id: (0, utils_1.generateDocId)(),
                type: 'ban',
                guild: guildId,
                userId: user.id,
                userTag: user.tag,
                modId: author.id,
                modTag: author.tag,
                reason,
            });
            banned.push(user);
            await (0, utils_1.reply)(context, {
                embeds: [embed(banned.length)],
                replyToEdit,
            });
        }
        const options = banned.length !== 0 ? {
            color: 'Green',
            emoji: 'check',
            fieldName: 'Banned the following members:',
            fieldValue: banned.map(u => u.toString()).join(', '),
        } : {
            color: 'Red',
            emoji: 'cross',
            description: 'No members were banned.',
        };
        await (0, utils_1.reply)(context, {
            embeds: [(0, utils_1.basicEmbed)(options)],
            components: [],
            replyToEdit,
        });
    }
}
exports.default = MultiBanCommand;
async function isValidMember(message, user) {
    if (!user || !message.inGuild())
        return false;
    const { author, guild, client } = message;
    const member = await guild.members.fetch(user);
    const authorId = author.id;
    if (user.id !== client.user.id && user.id !== authorId) {
        if (!member.bannable)
            return false;
        if (guild.ownerId === authorId)
            return true;
        if ((0, utils_1.isModerator)(member))
            return false;
        return true;
    }
    else {
        return true;
    }
}
async function parseUsers(context, args, message, command) {
    const results = context.isInteraction()
        ? Object.entries(args)
            .filter((entry) => /^user\d+$/.test(entry[0]))
            .map(([, role]) => role)
        : await Promise.all(args.users.split(/ +/).map(query => (0, utils_1.parseArgInput)(query, message, command.argsCollector?.args[1], 'user')));
    return pixoll_commando_1.Util.filterNullishItems(results);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGktYmFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC9tdWx0aS1iYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQTRHO0FBQzVHLHFEQVN5QjtBQUN6Qix1Q0FZcUI7QUFFckIsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztLQUNYLEVBQUU7UUFDQyxHQUFHLEVBQUUsT0FBTztRQUNaLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBeUIsQ0FBQztZQUMvRSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BFLE1BQU0sS0FBSyxHQUFjLEVBQUUsQ0FBQztZQUM1QixLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBNEIsQ0FBQyxDQUFDO2dCQUNuRixJQUFJLENBQUMsUUFBUTtvQkFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxF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