import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, replyAll } from '../../utils/functions';

export default class PollsCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'polls',
            group: 'lists',
            description: 'Displays all the on-going polls on this server. Use the `poll` command to add polls.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;
        const db = guild.database.polls;

        const pollsData = await db.fetchMany();
        if (pollsData.size === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no active polls.',
            }));
            return;
        }

        await generateEmbed(context, pollsData.toJSON(), {
            number: 5,
            authorName: `There's ${pluralize('active poll', pollsData.size)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            title: 'Poll',
            keys: ['channel', 'duration', 'endsAt'],
        });
    }
}
