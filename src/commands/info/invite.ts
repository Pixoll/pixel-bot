import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { Command, CommandContext, CommandoClient, Util } from 'pixoll-commando';
import { basicEmbed, replyAll } from '../../utils';

export default class InviteCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'invite',
            aliases: ['support'],
            group: 'info',
            description: 'Invite this bot to your server.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const { botInvite, options } = this.client;

        const invite = botInvite ? new ButtonBuilder()
            .setEmoji('🔗')
            .setLabel('Invite me')
            .setStyle(ButtonStyle.Link)
            .setURL(botInvite)
            : null;

        const support = options.serverInvite ? new ButtonBuilder()
            .setEmoji('🛠')
            .setLabel('Support server')
            .setStyle(ButtonStyle.Link)
            .setURL(options.serverInvite)
            : null;

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(Util.filterNullishItems([
                invite,
                support,
            ]));

        if (row.components.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                description: 'No links found for bot invite or support server.',
                emoji: 'cross',
            }));
            return;
        }

        await replyAll(context, {
            content: '\u200B',
            components: [row],
        });
    }
}
