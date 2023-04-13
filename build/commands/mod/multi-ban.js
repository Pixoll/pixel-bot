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