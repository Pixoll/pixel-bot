import { ms } from 'better-ms';
import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo } from 'pixoll-commando';
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
    prompt: 'What member do you want to mute?',
    type: 'member',
}, {
    key: 'duration',
    prompt: 'How long should the mute last?',
    type: ['date', 'duration'],
}, {
    key: 'reason',
    prompt: 'What is the reason of the mute?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class MuteCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'mute',
            group: 'mod',
            description: 'Mute a member so they cannot send messages or speak.',
            detailedDescription: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'mute [member] [duration] <reason>',
            examples: ['mute Pixoll 2h', 'mute Pixoll 6h Excessive swearing'],
            clientPermissions: ['ManageRoles'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { member: passedMember, duration, reason }: ParsedArgs): Promise<void> {
        const parsedDuration = await parseArgDate(context, this as Command, 1, duration);
        if (!parsedDuration) return;
        duration = parsedDuration;
        reason ??= 'No reason given.';

        const { guild, guildId, member: mod, author } = context;
        const { moderations, active, setup } = guild.database;
        const member = await guild.members.fetch(passedMember.id).catch(() => null);
        if (!member) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }

        const { roles, user } = member;

        const data = await setup.fetch();
        if (!data || !data.mutedRole) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.',
            }));
            return;
        }

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

        const role = await guild.roles.fetch(data.mutedRole);
        if (!role) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.',
            }));
            return;
        }

        if (roles.cache.has(role.id)) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already muted.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'mute',
            target: user,
            reason,
        });
        if (!confirmed) return;

        const now = Date.now();
        if (typeof duration === 'number') duration = duration + now;
        if (duration instanceof Date) duration = duration.getTime();

        await roles.add(role.id);
        this.client.emit('guildMemberMute', guild, author, user, reason, duration);

        if (!user.bot) await user.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been muted on ${guild.name}`,
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
            type: 'mute',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
            duration: ms(duration - now, { long: true }),
        });
        await active.add({
            _id: documentId,
            type: 'mute',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            duration,
        });

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been muted`,
            fieldValue: stripIndent`
            **Expires:** ${timestamp(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
