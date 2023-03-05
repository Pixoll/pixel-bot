import { stripIndent } from 'common-tags';
import { TextChannel, ChannelType } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import {
    generateDocId,
    basicEmbed,
    userException,
    memberException,
    inviteButton,
    confirmButtons,
    replyAll,
    sevenDays,
} from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to soft-ban?',
    type: 'user',
}, {
    key: 'reason',
    prompt: 'What is the reason of the soft-ban?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class SoftBanCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'soft-ban',
            aliases: ['softban'],
            group: 'mod',
            description: 'Soft-ban a user (Ban to delete their messages and then immediately unban).',
            details: stripIndent`
                \`user\` has to be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'soft-ban [user] <reason>',
            examples: [
                'soft-ban Pixoll',
                'soft-ban Pixoll Mass-spam',
            ],
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { user, reason }: ParsedArgs): Promise<void> {
        reason ??= 'No reason given.';
        const { guild, guildId, member: mod, author } = context;
        const { members, bans, database } = guild;

        const userError = userException(user, author, this as Command);
        if (userError) {
            await replyAll(context, basicEmbed(userError));
            return;
        }

        const isBanned = await bans.fetch(user).catch(() => null);
        if (isBanned) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is already banned.',
            }));
            return;
        }

        const member = await members.fetch(user).catch(() => null);
        const memberError = memberException(member, mod, this as Command);
        if (memberError) {
            await replyAll(context, basicEmbed(memberError));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'soft-ban',
            target: user,
            reason,
        });
        if (!confirmed) return;

        if (!user.bot && !!member) {
            const embed = basicEmbed({
                color: 'Gold',
                fieldName: `You have been soft-banned from ${guild.name}`,
                fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}

                *The invite will expire in 1 week.*
                `,
            });

            const channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText) as TextChannel;
            const button = inviteButton(await channel.createInvite({
                maxAge: sevenDays,
                maxUses: 1,
            }));

            await user.send({
                embeds: [embed],
                components: [button],
            }).catch(() => null);
        }

        await members.ban(user, { deleteMessageSeconds: sevenDays, reason });
        await members.unban(user, 'Soft-ban.');

        await database.moderations.add({
            _id: generateDocId(),
            type: 'soft-ban',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
        });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been soft-banned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
