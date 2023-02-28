import { ApplicationCommandOptionType } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, abcOrder, replyAll } from '../../utils/functions';

const args = [{
    key: 'role',
    prompt: 'What role do you want to get the members from?',
    type: 'role',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class MembersCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'members',
            group: 'lists',
            description: 'Displays a list of members in a role.',
            details: '`role` can be either a role\'s name, mention or ID.',
            format: 'members [role]',
            examples: ['members Staff'],
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Role,
                name: 'role',
                description: 'The role to get the members from.',
                required: true,
            }],
        });
    }

    public async run(context: CommandContext<true>, { role }: ParsedArgs): Promise<void> {
        const members = role.members.sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(member => `${member.toString()} ${member.user.tag}`);

        if (members.length === 0) {
            await replyAll(context, basicEmbed({
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
