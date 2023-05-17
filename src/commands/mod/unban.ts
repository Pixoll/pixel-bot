import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo } from 'pixoll-commando';
import { basicEmbed, confirmButtons, reply } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to unban?',
    type: 'user',
}, {
    key: 'reason',
    prompt: 'What is the reason of the unban?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class UnbanCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'unban',
            group: 'mod',
            description: 'Unban a user.',
            detailedDescription: stripIndent`
                \`user\` has to be a user's ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'unban [user] <reason>',
            examples: [
                'unban 667937325002784768',
                'unban 802267523058761759 Appealed',
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
        const { members, bans, database } = context.guild;
        const { active } = database;

        const isBanned = await bans.fetch(user.id).catch(() => null);
        if (!isBanned) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not banned.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'unban',
            target: user,
            reason,
        });
        if (!confirmed) return;

        await members.unban(user, reason);

        const data = await active.fetch({ type: 'temp-ban', userId: user.id });
        if (data) await active.delete(data);

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been unbanned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
