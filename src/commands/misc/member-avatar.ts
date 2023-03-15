import { stripIndent } from 'common-tags';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, pixelColor, replyAll } from '../../utils';

const args = [{
    key: 'member',
    prompt: 'What member do you want to get their server avatar from?',
    type: 'member',
    required: false,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class MemberAvatarCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'member-avatar',
            aliases: ['memberavatar', 'mavatar', 'mav'],
            group: 'misc',
            description: 'Displays a member\'s server avatar, or yours if you don\'t specify any.',
            detailedDescription: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                If no server avatar was found, it will display the user\'s avatar instead.
            `,
            format: 'member-avatar <member>',
            examples: ['member-avatar Pixoll'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { member: passedMember }: ParsedArgs): Promise<void> {
        const member = await context.guild.members.fetch(
            passedMember?.id ?? context.member?.id ?? ''
        ).catch(() => null);
        if (!member) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'Invalid member',
            }));
            return;
        }

        const { user, displayName } = member;
        let avatarUrl = member.displayAvatarURL({ forceStatic: false, size: 2048 }) as string;
        if (avatarUrl && /\.webp/.test(avatarUrl)) {
            avatarUrl = member.displayAvatarURL({ extension: 'png', size: 2048 }) as string;
        }

        const embed = new EmbedBuilder()
            .setColor(pixelColor)
            .setAuthor({
                name: `${user.tag} • AKA ${displayName}`,
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

        await replyAll(context, { embeds: [embed], components: [row] });
    }
}
