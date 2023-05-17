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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGktYmFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC9tdWx0aS1iYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQTRHO0FBQzVHLHFEQVV5QjtBQUN6Qix1Q0FZcUI7QUFFckIsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztLQUNYLEVBQUU7UUFDQyxHQUFHLEVBQUUsT0FBTztRQUNaLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBeUIsQ0FBQztZQUMvRSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BFLE1BQU0sS0FBSyxHQUFjLEVBQUUsQ0FBQztZQUM1QixLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBNEIsQ0FBQyxDQUFDO2dCQUNuRixJQUFJLENBQUMsUUFBUTtvQkFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxF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