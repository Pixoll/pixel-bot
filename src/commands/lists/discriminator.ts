import { ApplicationCommandOptionType } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, generateEmbed, pluralize, abcOrder, replyAll } from '../../utils/functions';

const args = [{
    key: 'number',
    prompt: 'What discriminator do you want to look for?',
    type: 'integer',
    parse: (value: string[] | string): number =>
        +(Array.isArray(value) ? value[0] : value).padStart(4, '0').slice(-4),
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
        }, {
            options: [{
                type: ApplicationCommandOptionType.Integer,
                name: 'number',
                description: 'The discriminator to look for.',
                required: true,
                minValue: 1,
                maxValue: 9999,
            }],
        });
    }

    public async run(context: CommandContext<true>, { number }: ParsedArgs): Promise<void> {
        const { guild } = context;
        const members = guild.members.cache;

        if (context.isInteraction()) {
            number = +number.toString().padStart(4, '0').slice(-4);
        }

        const match = members.filter(member => member.user.discriminator === number.toString())
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
            authorName: `Found ${pluralize('member', match.length)}`,
            useDescription: true,
        });
    }
}
