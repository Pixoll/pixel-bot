import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo } from 'pixoll-commando';
import { ChannelType, TextChannel } from 'discord.js';
import {
    generateDocId,
    basicEmbed,
    memberException,
    userException,
    inviteButton,
    confirmButtons,
    reply,
    sevenDays,
} from '../../utils';
import { stripIndent } from 'common-tags';

const args = [{
    key: 'member',
    prompt: 'What member do you want to kick?',
    type: 'member',
}, {
    key: 'reason',
    prompt: 'What is the reason of the kick?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class KickCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'kick',
            group: 'mod',
            description: 'Kick a member.',
            detailedDescription: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'kick [member] <reason>',
            examples: [
                'kick Pixoll',
                'kick Pixoll Get out!',
            ],
            clientPermissions: ['KickMembers'],
            userPermissions: ['KickMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { member: passedMember, reason }: ParsedArgs): Promise<void> {
        reason ??= 'No reason given.';
        const { guild, guildId, member: mod, author } = context;

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

        const confirmed = await confirmButtons(context, {
            action: 'kick',
            target: user,
            reason,
        });
        if (!confirmed) return;

        if (!user.bot) {
            const embed = basicEmbed({
                color: 'Gold',
                fieldName: `You have been kicked from ${guild.name}`,
                fieldValue: stripIndent`
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()} ${author.tag}

                    *The invite will expire in 1 week.*
                `,
            });

            const channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText) as unknown as TextChannel;
            const button = inviteButton(await channel.createInvite({
                maxAge: sevenDays,
                maxUses: 1,
            }));

            await user.send({ embeds: [embed], components: [button] }).catch(() => null);
        }

        await guild.members.kick(user, reason);

        await guild.database.moderations.add({
            _id: generateDocId(),
            type: 'kick',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
        });

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been kicked`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
