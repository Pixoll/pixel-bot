import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, reply } from '../../utils';

export default class AdministratorsCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'administrators',
            aliases: ['admins'],
            group: 'lists',
            description: 'Displays a list of all administrators of the server with their admin roles.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;
        const members = guild.members.cache;

        const admins = members.filter(member => member.permissions.has('Administrator') && !member.user.bot);
        if (!admins || admins.size === 0) {
            await reply(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no administrators, try running the `moderators` command instead.',
            }));
            return;
        }

        const adminsList = admins.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(member => ({
                tag: member.user.tag,
                list: '**Roles:** ' + (member.roles.cache.filter(r => r.permissions.has('Administrator'))
                    .sort((a, b) => b.position - a.position).map(r => r.name).join(', ') || 'None'),
            }));

        await generateEmbed(context, adminsList, {
            authorName: `There's ${pluralize('administrator', adminsList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'tag' },
        });
    }
}
