import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, generateEmbed, pluralize, abcOrder, replyAll } from '../../utils';

const args = [{
    key: 'number',
    prompt: 'What discriminator do you want to look for?',
    type: 'integer',
    min: 1,
    max: 9999,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class DiscriminatorCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'discriminator',
            aliases: ['discrim'],
            group: 'lists',
            description: 'Displays a list of users with a discriminator.',
            details: '`number` has to be a number from 1 to 9999.',
            format: 'discriminator [number]',
            examples: ['discriminator 1234'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { number }: ParsedArgs): Promise<void> {
        const { guild } = context;
        const members = guild.members.cache;
        const discriminator = number.toString().padStart(4, '0').slice(-4);

        const match = members.filter(member => member.user.discriminator === discriminator)
            .sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`);

        if (!match || match.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find any members.',
            }));
            return;
        }

        await generateEmbed(context, match, {
            number: 20,
            authorName: `Found ${pluralize('member', match.length)} with discriminator #${discriminator}`,
            useDescription: true,
        });
    }
}
