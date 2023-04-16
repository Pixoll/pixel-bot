import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionData, ApplicationCommandOptionType, EmbedBuilder, User } from 'discord.js';
import {
    Argument,
    ArgumentType,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    Util,
} from 'pixoll-commando';
import {
    generateDocId,
    isModerator,
    basicEmbed,
    confirmButtons,
    reply,
    arrayWithLength,
    addOrdinalSuffix,
    parseArgInput,
    sevenDays,
    BasicEmbedOptions,
    getContextMessage,
} from '../../utils';

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
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const type = message.client.registry.types.get('user') as ArgumentType<'user'>;
        const queries = value?.split(/\s*,\s*/).slice(0, usersAmount) ?? [];
        const valid: boolean[] = [];
        for (const query of queries) {
            const isValid1 = await type.validate(query, message, argument as Argument<'user'>);
            if (!isValid1) valid.push(false);
            const user = await type.parse(query, message, argument as Argument<'user'>);
            const isValid2 = await isValidMember(message, user);
            valid.push(isValid2);
        }
        return valid.filter(b => b === true).length === 0;
    },
    error: 'None of the members you specified were valid. Please try again.',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    [K in SlashUserKey]?: User;
} & {
    message?: string;
};

type SlashUserKey = NumberedStringUnion<'user-', typeof usersAmount>;

export default class MultiBanCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'multi-ban',
            aliases: ['massban', 'multiban', 'mass-ban'],
            group: 'mod',
            description: `Ban multiple members at the same time (max. ${usersAmount} at once).`,
            detailedDescription: stripIndent`
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
                type: ApplicationCommandOptionType.String,
                name: 'reason',
                description: 'The reason of the multi-ban.',
                required: true,
            }, ...arrayWithLength<ApplicationCommandOptionData>(usersAmount, (n) => ({
                type: ApplicationCommandOptionType.User,
                name: `user-${n}`,
                description: `The ${addOrdinalSuffix(n)} user.`,
                required: n === 1,
            }))],
        });
    }

    public async run(context: CommandContext<true>, args: ParsedArgs): Promise<void> {
        const { guild, guildId, author } = context;
        const { reason } = args;

        const message = await getContextMessage<CommandoMessage>(context);
        const users = await parseUsers(context, args, message, this);
        const manager = guild.members;

        const embed = (n: number): EmbedBuilder => basicEmbed({
            color: 'Gold',
            emoji: 'loading',
            description: `Banned ${n}/${users.length} members...`,
        });
        const replyToEdit = await reply(context, embed(0));

        const banned: User[] = [];
        for (const user of users) {
            const confirmed = await confirmButtons(context, {
                action: 'ban',
                target: user,
                reason,
                sendCancelled: false,
            });
            if (!confirmed) continue;

            if (!user.bot) await user.send({
                embeds: [basicEmbed({
                    color: 'Gold',
                    fieldName: `You have been banned from ${guild.name}`,
                    fieldValue: stripIndent`
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()} ${author.tag}
                    `,
                })],
            }).catch(() => null);

            await manager.ban(user, { deleteMessageSeconds: sevenDays, reason });

            await guild.database.moderations.add({
                _id: generateDocId(),
                type: 'ban',
                guild: guildId,
                userId: user.id,
                userTag: user.tag,
                modId: author.id,
                modTag: author.tag,
                reason,
            });

            banned.push(user);
            await reply(context, {
                embeds: [embed(banned.length)],
                replyToEdit,
            });
        }

        const options: BasicEmbedOptions = banned.length !== 0 ? {
            color: 'Green',
            emoji: 'check',
            fieldName: 'Banned the following members:',
            fieldValue: banned.map(u => u.toString()).join(', '),
        } : {
            color: 'Red',
            emoji: 'cross',
            description: 'No members were banned.',
        };

        await reply(context, {
            embeds: [basicEmbed(options)],
            components: [],
            replyToEdit,
        });
    }
}

async function isValidMember(message: CommandoMessage, user: User | null): Promise<boolean> {
    if (!user || !message.inGuild()) return false;

    const { author, guild, client } = message;
    const member = await guild.members.fetch(user);
    const authorId = author.id;

    if (user.id !== client.user.id && user.id !== authorId) {
        if (!member.bannable) return false;
        if (guild.ownerId === authorId) return true;
        if (isModerator(member)) return false;
        return true;
    } else {
        return true;
    }
}

async function parseUsers(
    context: CommandContext, args: ParsedArgs, message: CommandoMessage, command: MultiBanCommand
): Promise<User[]> {
    const results = context.isInteraction()
        ? Object.entries(args)
            .filter((entry): entry is [SlashUserKey, User] => /^user\d+$/.test(entry[0]))
            .map(([, role]) => role)
        : await Promise.all(args.users.split(/ +/).map(query =>
            parseArgInput(query, message, command.argsCollector?.args[1] as Argument, 'user')
        ));
    return Util.filterNullishItems(results);
}
