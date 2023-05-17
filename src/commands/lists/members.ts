import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, alphabeticalOrder, reply } from '../../utils';

const args = [{
    key: 'role',
    prompt: 'What role do you want to get the members from?',
    type: 'role',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class MembersCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'members',
            group: 'lists',
            description: 'Displays a list of members in a role.',
            detailedDescription: '`role` can be either a role\'s name, mention or ID.',
            format: 'members [role]',
            examples: ['members Staff'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { role }: ParsedArgs): Promise<void> {
        const members = role.members
            .map(m => m.user)
            .sort(alphabeticalOrder({
                sortKey: 'tag',
                forceCase: false,
            }))
            .map(user => `${user.toString()} ${user.tag}`);

        if (members.length === 0) {
            await reply(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: `The \`${role.name}\` role has no members.`,
            }));
            return;
        }

        const { guild } = context;
        await generateEmbed(context, members, {
            number: 20,
            authorName: `There's ${pluralize('member', members.length)} in ${role.name}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            useDescription: true,
        });
    }
}
