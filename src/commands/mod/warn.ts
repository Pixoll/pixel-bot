import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { generateDocId, basicEmbed, userException, confirmButtons, replyAll } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to warn?',
    type: 'user',
}, {
    key: 'reason',
    prompt: 'What is the reason of the warn?',
    type: 'string',
    max: 512,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class warnCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'warn',
            group: 'mod',
            description: 'Warn a member.',
            details: '`member` can be a member\'s username, ID or mention. `reason` can be anything you want.',
            format: 'warn [user] [reason]',
            examples: ['warn Pixoll Excessive swearing'],
            modPermissions: true,
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    /**
     * Runs the command
     * @param {CommandContext} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to warn
     * @param {string} args.reason The reason of the warn
     */
    public async run(context: CommandContext<true>, { user, reason }: ParsedArgs): Promise<void> {
        const { guild, guildId, author } = context;
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

        if (user.bot) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'You can\'t warn a bot.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'warn',
            target: user,
            reason,
        });
        if (!confirmed) return;

        await user.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been warned on ${guild.name}`,
                fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
            })],
        }).catch(() => null);

        await guild.database.moderations.add({
            _id: generateDocId(),
            type: 'warn',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
        });
        this.client.emit('guildMemberWarn', guild, author, user, reason);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been warned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
