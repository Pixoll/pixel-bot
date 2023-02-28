import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, replyAll } from '../../utils/functions';

export default class InvitesCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'invites',
            group: 'lists',
            description: 'Displays a list of all the invites of this server, ordered by most to least used.',
            clientPermissions: ['ManageGuild'],
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;

        const invites = await guild.invites.fetch().catch(() => null);
        if (!invites || invites.size === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no invites in this server.',
            }));
            return;
        }

        const invitesList = invites.map(inv => ({
            uses: inv.uses ?? 0,
            inviter: inv.inviter?.tag,
            channel: inv.channel?.toString(),
            link: inv.url,
            code: inv.code,
        })).sort((a, b) => b.uses - a.uses);

        await generateEmbed(context, invitesList, {
            authorName: `There's ${pluralize('invite', invitesList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'link' },
        });
    }
}
