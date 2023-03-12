import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, User } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { replyAll } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to get their avatar from?',
    type: 'user',
    required: false,
}] as const;

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
        });
    }

    public async run(context: CommandContext, { user: passedUser }: ParsedArgs): Promise<void> {
        const user = passedUser as User ?? context.author;

        let avatarUrl = user.displayAvatarURL({ forceStatic: false, size: 2048 });
        if (/\.webp/.test(avatarUrl)) {
            avatarUrl = user.displayAvatarURL({ extension: 'png', size: 2048 });
        }

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: user.tag, iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setImage(avatarUrl)
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Download')
                .setURL(avatarUrl)
            );

        await replyAll(context, { embeds: [embed], components: [row] });
    }
}
