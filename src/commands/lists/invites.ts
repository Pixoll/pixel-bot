import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, replyAll, timestamp } from '../../utils';

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

        const invitesList = invites.map(invite => ({
            uses: invite.uses ?? 0,
            inviter: invite.inviter
                ? `${invite.inviter.toString()} ${invite.inviter.tag}`
                : 'Inviter is unavailable.',
            channel: invite.channel?.toString(),
            link: invite.url,
            code: invite.code,
            expires: timestamp(invite.expiresTimestamp, 'R', true) ?? 'Never',
        })).sort((a, b) => b.uses - a.uses);

        await generateEmbed(context, invitesList, {
            authorName: `There's ${pluralize('invite', invitesList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'link' },
        });
    }
}
