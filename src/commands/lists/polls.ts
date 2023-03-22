import { Command, CommandContext, CommandoClient, Util } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, replyAll } from '../../utils';

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
        const pollsData = await guild.database.polls.fetchMany();
        if (pollsData.size === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no active polls.',
            }));
            return;
        }

        const polls = pollsData.map(poll => ({
            endsAt: poll.duration,
            ...Util.omit(poll, ['duration']),
        }));

        await generateEmbed(context, polls, {
            number: 5,
            authorName: `There's ${pluralize('active poll', pollsData.size)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            title: 'Poll',
            keys: ['channel', 'endsAt'],
        });
    }
}
