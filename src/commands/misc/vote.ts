import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { replyAll } from '../../utils/functions';

export default class VoteCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'vote',
            group: 'misc',
            description: 'Vote for the bot and make it grow!',
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setEmoji('👍')
                .setLabel('Vote me')
                .setURL('https://top.gg/bot/802267523058761759/vote')
            );

        await replyAll(context, {
            content: 'Vote for the bot with the button below!',
            components: [row],
        });
    }
}
