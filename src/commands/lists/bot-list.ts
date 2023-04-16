import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { generateEmbed, pluralize, alphabeticalOrder } from '../../utils';

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
            .map(member => member.user)
            .sort(alphabeticalOrder({
                sortKey: 'tag',
            }))
            .map(bot => `${bot.toString()} ${bot.tag}`);

        await generateEmbed(context, botList, {
            number: 20,
            authorName: `There's ${pluralize('bot', botList.length)}`,
            useDescription: true,
        });
    }
}
