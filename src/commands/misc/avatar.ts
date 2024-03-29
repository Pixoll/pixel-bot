import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    User,
    ApplicationCommandType,
    MessageCreateOptions,
} from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    CommandoUserContextMenuCommandInteraction,
    ParseRawArguments,
    ReadonlyArgumentInfo,
} from 'pixoll-commando';
import { pixelColor, reply } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to get their avatar from?',
    type: 'user',
    required: false,
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class AvatarCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'avatar',
            aliases: ['av'],
            group: 'misc',
            description: 'Displays a user\'s avatar, or yours if you don\'t specify any.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'avatar <user>',
            examples: ['avatar Pixoll'],
            args,
            autogenerateSlashCommand: true,
            contextMenuCommandTypes: [ApplicationCommandType.User],
        });
    }

    public async run(context: CommandContext, { user: passedUser }: ParsedArgs): Promise<void> {
        const user = passedUser as unknown as User ?? context.author;
        await reply(context, mapAvatarData(user));
    }

    public override async runUserContextMenu(interaction: CommandoUserContextMenuCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        await reply(interaction, mapAvatarData(interaction.targetUser));
    }
}

function mapAvatarData(user: User): Pick<MessageCreateOptions, 'components' | 'embeds'> {
    let avatarUrl = user.displayAvatarURL({ forceStatic: false, size: 2048 });
    if (/\.webp/.test(avatarUrl)) {
        avatarUrl = user.displayAvatarURL({ extension: 'png', size: 2048 });
    }

    const embed = new EmbedBuilder()
        .setColor(pixelColor)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
        .setImage(avatarUrl)
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Download')
            .setURL(avatarUrl)
        );

    return {
        embeds: [embed],
        components: [row],
    };
}
