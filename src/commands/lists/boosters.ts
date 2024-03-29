import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { generateEmbed, pluralize, alphabeticalOrder, basicEmbed, reply } from '../../utils';

export default class BoostersCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'boosters',
            aliases: ['boosts'],
            group: 'lists',
            description: 'Displays a list of the members that have boosted the server.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;
        const members = guild.members.cache;
        const boosters = members.filter(member => member.roles.premiumSubscriberRole)
            .map(member => member.user)
            .sort(alphabeticalOrder({
                sortKey: 'tag',
            }))
            .map(user => `${user.toString()} ${user.tag}`);

        if (boosters.length === 0) {
            await reply(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no boosters in this server.',
            }));
            return;
        }

        await generateEmbed(context, boosters, {
            number: 20,
            authorName: `There's ${pluralize('booster', boosters.length)}`,
            useDescription: true,
        });
    }
}
