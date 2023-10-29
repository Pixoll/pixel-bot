import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { customEmoji, reply } from '../../utils';

export default class PingCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'ping',
            group: 'info',
            description: 'Pong! 🏓',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const now = Date.now();
        const isMessage = context.isMessage();
        const replyToEdit = isMessage ? await context.reply(`${customEmoji('loading')} Pinging...`) : null;

        const roundtrip = Math.abs(replyToEdit
            ? (replyToEdit.createdTimestamp - context.createdTimestamp)
            : (context.createdTimestamp - now)
        );
        const heartbeat = Math.round(this.client.ws.ping || 0);

        const type = isMessage ? 'Messages' : 'Interactions';
        await reply(context, {
            replyToEdit,
            content: stripIndent`
                🏓 **Pong!**
                **${type} ping:** ${roundtrip}ms
                **API ping:** ${heartbeat}ms
            `
        });
    }
}
