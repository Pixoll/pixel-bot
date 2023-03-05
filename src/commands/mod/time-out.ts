import { ms } from 'better-ms';
import { oneLine, stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import {
    userException,
    memberException,
    timestamp,
    confirmButtons,
    replyAll,
    generateDocId,
    basicEmbed,
    parseArgDate,
} from '../../utils';

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
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TimeOutCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'time-out',
            aliases: ['timeout'],
            group: 'mod',
            description: 'Set or remove time-out for user so they cannot send messages or join VCs.',
            details: stripIndent`
                \`user\` can be either a user's name, mention or ID.
                ${oneLine`
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
            testEnv: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { user, duration, reason }: ParsedArgs): Promise<void> {
        const parsedDuration = await parseArgDate(context, this as Command, 1, duration);
        if (!parsedDuration) return;
        duration = parsedDuration;
        reason ??= 'No reason given.';

        const now = Date.now();
        if (typeof duration === 'number') duration = duration + now;
        if (duration instanceof Date) duration = duration.getTime();

        const { guild, guildId, member: mod, author } = context;
        const { moderations } = guild.database;
        const member = await guild.members.fetch(user).catch(() => null);
        if (!member) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }

        const userError = userException(user, author, this as Command);
        if (userError) {
            await replyAll(context, basicEmbed(userError));
            return;
        }
        const memberError = memberException(member, mod, this as Command);
        if (memberError) {
            await replyAll(context, basicEmbed(memberError));
            return;
        }

        const isTimedOut = member.isCommunicationDisabled();
        if (isTimedOut && duration !== 0) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already timed-out.',
            }));
            return;
        }
        if (!isTimedOut && duration === 0) {
            await replyAll(context, basicEmbed({
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

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been timed-out`,
            fieldValue: stripIndent`
            **Expires:** ${timestamp(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
