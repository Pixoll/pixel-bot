import { ms } from 'better-ms';
import { oneLine, stripIndent } from 'common-tags';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    ReadonlyArgumentInfo,
    Util,
} from 'pixoll-commando';
import {
    userException,
    memberException,
    timestamp,
    confirmButtons,
    reply,
    generateDocId,
    basicEmbed,
    parseArgDate,
} from '../../utils';

const args = [{
    key: 'member',
    prompt: 'What member do you want to time-out?',
    type: 'member',
}, {
    key: 'duration',
    prompt: 'How long should the time-out last? (max. of 28 days). Set to 0 to remove a timeout.',
    type: ['date', 'duration'],
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        if (typeof value === 'undefined') return false;
        if (parseInt(value) === 0) return true;
        return await argument.type?.validate(value, message, argument) ?? true;
    },
    async parse(value: string, message: CommandoMessage, argument: Argument): Promise<Date | number> {
        if (parseInt(value) === 0) return 0;
        return await argument.type?.parse(value, message, argument) as Date | number;
    },
}, {
    key: 'reason',
    prompt: 'What is the reason of the time-out?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TimeOutCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'timeout',
            group: 'mod',
            description: 'Set or remove a timeout for a member so they cannot send messages or join VCs.',
            detailedDescription: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                ${oneLine`
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

    public async run(context: CommandContext<true>, { member: passedMember, duration, reason }: ParsedArgs): Promise<void> {
        const parsedDuration = await parseArgDate(context, this as Command, 1, duration, undefined, 0);
        if (Util.isNullish(parsedDuration)) return;
        duration = parsedDuration;
        reason ??= 'No reason given.';

        const { guild, guildId, member: mod, author } = context;
        const { moderations } = guild.database;
        const member = await guild.members.fetch(passedMember.id).catch(() => null);
        if (!member) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }

        const { user } = member;
        const userError = userException(user, author, this as Command);
        if (userError) {
            await reply(context, basicEmbed(userError));
            return;
        }
        const memberError = memberException(member, mod, this as Command);
        if (memberError) {
            await reply(context, basicEmbed(memberError));
            return;
        }

        const isTimedOut = member.isCommunicationDisabled();
        if (isTimedOut && duration !== 0) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already timed-out.',
            }));
            return;
        }
        if (!isTimedOut && duration === 0) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user has not been timed-out.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: (isTimedOut ? 'remove' : 'set') + ' time-out',
            target: user,
            reason,
        });
        if (!confirmed) return;

        const now = Date.now();
        if (typeof duration === 'number') duration = duration + now;
        if (duration instanceof Date) duration = duration.getTime();

        await member.disableCommunicationUntil(isTimedOut ? null : duration, reason);
        if (!isTimedOut) {
            this.client.emit('guildMemberTimeout', guild, author, user, reason, duration);
        }

        if (!user.bot) await user.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been timed-out on ${guild.name}`,
                fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R', true)}
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
            })],
        }).catch(() => null);

        const documentId = generateDocId();

        await moderations.add({
            _id: documentId,
            type: 'time-out',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
            duration: ms(duration - now, { long: true }),
        });

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: isTimedOut
                ? `${user.tag}'s timed-out has been removed`
                : `${user.tag} has been timed-out`,
            fieldValue: stripIndent`
            ${!isTimedOut ? `**Expires:** ${timestamp(duration, 'R', true)}` : ''}
            **Reason:** ${reason}
            `,
        }));
    }
}
