import { ms } from 'better-ms';
import { stripIndent } from 'common-tags';
import { TextChannel, ChannelType } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo } from 'pixoll-commando';
import {
    generateDocId,
    basicEmbed,
    userException,
    memberException,
    timestamp,
    inviteButton,
    confirmButtons,
    reply,
    parseArgDate,
    sevenDays,
} from '../../utils';

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
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TempBanCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'temp-ban',
            aliases: ['tempban'],
            group: 'mod',
            description: 'Ban a user for a specified amount of time.',
            detailedDescription: stripIndent`
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

    public async run(context: CommandContext<true>, { user, duration, reason }: ParsedArgs): Promise<void> {
        const parsedDuration = await parseArgDate(context, this as Command, 1, duration);
        if (!parsedDuration) return;
        duration = parsedDuration;
        reason ??= 'No reason given.';

        const { guild, guildId, member: mod, author } = context;
        const { members, bans, database } = guild;
        const { moderations, active } = database;

        const userError = userException(user, author, this as Command);
        if (userError) {
            await reply(context, basicEmbed(userError));
            return;
        }

        const isBanned = await bans.fetch(user.id).catch(() => null);
        if (isBanned) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already banned.',
            }));
            return;
        }

        const member = await members.fetch(user).catch(() => null);
        const memberError = memberException(member, mod, this as Command);
        if (memberError) {
            await reply(context, basicEmbed(memberError));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'temp-ban',
            target: user,
            reason,
        });
        if (!confirmed) return;

        const now = Date.now();
        if (typeof duration === 'number') duration = duration + now;
        if (duration instanceof Date) duration = duration.getTime();

        if (!user.bot && member) {
            const embed = basicEmbed({
                color: 'Gold',
                fieldName: `You have been temp-banned from ${guild.name}`,
                fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R', true)}
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}

                *The invite will expire in 1 week.*
                `,
            });

            const channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText) as unknown as TextChannel;
            const button = inviteButton(await channel.createInvite({
                maxAge: 0,
                maxUses: 1,
            }));

            await user.send({
                embeds: [embed],
                components: [button],
            }).catch(() => null);
        }

        await members.ban(user, { deleteMessageSeconds: sevenDays, reason });

        const documentId = generateDocId();

        await moderations.add({
            _id: documentId,
            type: 'temp-ban',
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
            type: 'temp-ban',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            duration,
        });

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been banned`,
            fieldValue: stripIndent`
            **Expires:** ${timestamp(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
