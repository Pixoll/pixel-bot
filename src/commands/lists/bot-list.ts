import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { generateEmbed, pluralize, abcOrder } from '../../utils';

export default class BotListCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'bot-list',
            aliases: ['bots', 'botlist'],
            group: 'lists',
            description: 'Displays the bot list of the server.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;
        const members = guild.members.cache;
        const botList = members.filter(m => m.user.bot)
            .sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(bot => `${bot.toString()} ${bot.user.tag}`);

        await generateEmbed(context, botList, {
            number: 20,
            authorName: `There's ${pluralize('bot', botList.length)}`,
            useDescription: true,
        });
    }
}
