import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { User, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';
import { basicEmbed, replyAll } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to get their avatar from?',
    type: 'user',
    required: false,
}] as const;

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
        });
    }

    /**
     * Runs the command
     * @param {CommandContext} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the banner from
     */
    public async run(context: CommandContext, { user: passedUser }: ParsedArgs): Promise<void> {
        const user = await (passedUser as User ?? context.author).fetch();

        let bannerUrl = user.bannerURL({ forceStatic: false, size: 2048 }) ?? null;
        if (!bannerUrl) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'That user has no banner on their profile.',
            }));
            return;
        }
        if (/\.webp/.test(bannerUrl)) {
            bannerUrl = user.bannerURL({ extension: 'png', size: 2048 }) as string;
        }

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: user.tag, iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setImage(bannerUrl)
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Download')
                .setURL(bannerUrl)
            );

        await replyAll(context, { embeds: [embed], components: [row] });
    }
}
