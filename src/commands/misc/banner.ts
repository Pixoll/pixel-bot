import {
    Command,
    CommandContext,
    CommandoClient,
    CommandoUserContextMenuCommandInteraction,
    ParseRawArguments,
    ReadonlyArgumentInfo,
} from 'pixoll-commando';
import {
    User,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    ApplicationCommandType,
    MessageCreateOptions,
} from 'discord.js';
import { basicEmbed, pixelColor, reply } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to get their avatar from?',
    type: 'user',
    required: false,
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class BannerCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'banner',
            group: 'misc',
            description: 'Displays a user\'s banner, or yours if you don\'t specify any.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'banner <user>',
            examples: ['banner Pixoll'],
            args,
            autogenerateSlashCommand: true,
            contextMenuCommandTypes: [ApplicationCommandType.User],
        });
    }

    public async run(context: CommandContext, { user: passedUser }: ParsedArgs): Promise<void> {
        const user = await (passedUser ?? context.author).fetch();
        await reply(context, mapBannerData(user));
    }

    public override async runUserContextMenu(interaction: CommandoUserContextMenuCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        await interaction.targetUser.fetch();
        await reply(interaction, mapBannerData(interaction.targetUser));
    }
}

function mapBannerData(user: User): Pick<MessageCreateOptions, 'components' | 'embeds'> {
    let bannerUrl = user.bannerURL({ forceStatic: false, size: 2048 }) ?? null;
    if (!bannerUrl) return {
        embeds: [basicEmbed({
            color: 'Blue',
            emoji: 'info',
            description: 'That user has no banner on their profile.',
        })],
    };

    if (/\.webp/.test(bannerUrl)) {
        bannerUrl = user.bannerURL({ extension: 'png', size: 2048 }) as string;
    }

    const embed = new EmbedBuilder()
        .setColor(pixelColor)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
        .setImage(bannerUrl)
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Download')
            .setURL(bannerUrl)
        );

    return {
        embeds: [embed],
        components: [row],
    };
}
