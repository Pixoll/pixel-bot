import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { pixelColor, reply } from '../../utils';

export default class ServerIconCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'server-icon',
            aliases: ['servericon', 'sicon'],
            group: 'misc',
            description: 'Displays the server\'s icon.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;

        let iconUrl = guild.iconURL({ forceStatic: false, size: 2048 });
        if (iconUrl && /\.webp/.test(iconUrl)) {
            iconUrl = guild.iconURL({ extension: 'png', size: 2048 });
        }

        const embed = new EmbedBuilder()
            .setColor(pixelColor)
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setImage(iconUrl)
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Download')
                .setURL(iconUrl as string)
            );

        await reply(context, { embeds: [embed], components: [row] });
    }
}
