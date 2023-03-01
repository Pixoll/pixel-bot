import { stripIndent } from 'common-tags';
import { EmbedBuilder, Message } from 'discord.js';
import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { basicEmbed, replyAll } from '../../utils/functions';

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
        const pingMsg = isMessage ? await context.replyEmbed(basicEmbed({
            color: 'Gold',
            emoji: 'loading',
            description: 'Pinging...',
        })) as Message | null : null;

        const roundtrip = Math.abs(pingMsg
            ? (pingMsg.createdTimestamp - context.createdTimestamp)
            : (context.createdTimestamp - now)
        );
        const heartbeat = Math.round(this.client.ws.ping || 0);

        const type = isMessage ? 'Messages' : 'Interactions';
        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setTitle('🏓 Pong!')
            .setDescription(stripIndent`
                **${type} ping:** ${roundtrip}ms
                **API ping:** ${heartbeat}ms
            `);

        if (!isMessage) await replyAll(context, embed);
        await pingMsg?.edit({ embeds: [embed] }).catch(() => null);
    }
}
