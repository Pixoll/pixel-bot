import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { generateDocId, basicEmbed, userException, memberException, confirmButtons, reply, sevenDays } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to ban?',
    type: 'user',
}, {
    key: 'reason',
    prompt: 'What is the reason of the ban?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class BanCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'ban',
            group: 'mod',
            description: 'Ban a user permanently.',
            detailedDescription: stripIndent`
                \`user\` has to be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'ban [user] <reason>',
            examples: [
                'ban Pixoll',
                'ban Pixoll The Ban Hammer has Spoken!',
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
            await reply(context, basicEmbed(userError));
            return;
        }

        const isBanned = await bans.fetch(user).catch(() => null);
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
            action: 'ban',
            target: user,
            reason,
        });
        if (!confirmed) return;

        if (!user.bot && member) await user.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been banned from ${guild.name}`,
                fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
            })],
        }).catch(() => null);

        await members.ban(user, { deleteMessageSeconds: sevenDays, reason });

        await database.moderations.add({
            _id: generateDocId(),
            type: 'ban',
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
            fieldName: `${user.tag} has been banned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
