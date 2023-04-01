import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { basicEmbed, generateEmbed, abcOrder, pluralize, reply } from '../../utils';

interface Ban {
    tag: string;
    id: string;
    reason: string;
}

export default class BansCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'bans',
            group: 'mod-logs',
            description: 'Displays all the bans of the server.',
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;

        const bans = await guild.bans.fetch().catch(() => null);
        if (!bans || bans.size === 0) {
            await reply(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no bans in this server.',
            }));
            return;
        }

        const bansList = bans.map<Ban>(({ user, reason }) => ({
            tag: user.tag,
            id: user.id,
            reason: reason?.replace(/%20/g, ' ') || 'No reason given.',
        }));

        const sorted = bansList.sort((a, b) => abcOrder(a.tag.toUpperCase(), b.tag.toUpperCase()));

        await generateEmbed(context, sorted, {
            authorName: `${guild.name} has  ${pluralize('ban', bansList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'tag' },
        });
    }
}
