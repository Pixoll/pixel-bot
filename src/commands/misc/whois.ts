import { prettyMs } from 'better-ms';
import { ActivityType, ApplicationCommandType, EmbedBuilder, User } from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    CommandoUserContextMenuCommandInteraction,
    ParseRawArguments,
    Util,
} from 'pixoll-commando';
import { getKeyPerms, timestamp, customEmoji, reply, pixelColor, userFlagToEmojiMap } from '../../utils';

const activityTypeMap = Object.fromEntries(Util.getEnumEntries(ActivityType).map(([key, value]) =>
    [value, key] as [ActivityType, keyof typeof ActivityType]
));

const args = [{
    key: 'user',
    prompt: 'What user do you want to get information from?',
    type: 'user',
    required: false,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class WhoIsCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'whois',
            aliases: ['user-info', 'userinfo'],
            group: 'misc',
            description: 'Displays a user\'s information.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'who-is <user>',
            examples: ['who-is Pixoll'],
            args,
            autogenerateSlashCommand: true,
            contextMenuCommandTypes: [ApplicationCommandType.User],
        });
    }

    public async run(context: CommandContext, { user: passedUser }: ParsedArgs): Promise<void> {
        const user = await (passedUser ?? context.author).fetch();
        const userInfo = await mapUserInfo(context, user);
        await reply(context, userInfo);
    }

    public async runUserContextMenu(interaction: CommandoUserContextMenuCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        const userInfo = await mapUserInfo(interaction, interaction.targetUser);
        await reply(interaction, userInfo);
    }
}

async function mapUserInfo(
    context: CommandContext | CommandoUserContextMenuCommandInteraction, user: User
): Promise<EmbedBuilder> {
    const { guild } = context;

    const flags = await user.fetchFlags().catch(() => null);
    const member = await guild?.members.fetch(user).catch(() => null);
    const permissions = member ? getKeyPerms(member) : null;

    const description: Array<Nullable<string>> = [user.toString()];
    if (flags) {
        for (const flag of flags) description.push(userFlagToEmojiMap[flag]);
    }
    if (member?.premiumSince) description.push(customEmoji('boost'));
    if (!flags?.toArray().includes('VerifiedBot') && user.bot) {
        description.push(customEmoji('bot'));
    }

    const avatar = user.displayAvatarURL({ forceStatic: false, size: 2048 });

    const userInfo = new EmbedBuilder()
        .setColor(pixelColor)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
            url: avatar,
        })
        .setThumbnail(avatar)
        .setDescription(description.join(' '))
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp();

    if (member) {
        for (const { type, name, state, details, url, timestamps } of (member.presence?.activities ?? [])) {
            const status = details && state ? `${details}\n${state}` : details;
            const times = timestamps?.start ? !timestamps.end
                ? `Started ${timestamp(timestamps.start, 'R', true)}`
                : `${prettyMs(
                    timestamps.end.getTime() - timestamps.start.getTime(),
                    { verbose: true }
                )} left`
                : null;

            if (type === ActivityType.Custom && state) userInfo.addFields({
                name: 'Custom status:',
                value: state,
            });
            if (type === ActivityType.Streaming && url) userInfo.addFields({
                name: `Streaming ${name}`,
                value: url,
            });
            if (!Util.equals(type, [
                ActivityType.Competing, ActivityType.Custom, ActivityType.Streaming,
            ])) userInfo.addFields({
                name: `${activityTypeMap[type]} ${name}`,
                value: status ? `${status}\n${times}` : times ?? '\u200B',
            });
        }

        if (member.joinedTimestamp) userInfo.addFields({
            name: 'Joined',
            value: timestamp(member.joinedTimestamp, 'R', true),
            inline: true,
        });
    }

    userInfo.addFields({
        name: 'Registered',
        value: timestamp(user.createdTimestamp, 'R', true),
        inline: true,
    });

    if (member) {
        const acknowledgement = guild?.ownerId === member.id ? 'Server owner'
            : permissions === 'Administrator' ? permissions : null;
        if (acknowledgement) userInfo.addFields({
            name: 'Acknowledgement',
            value: acknowledgement,
            inline: true,
        });
    }

    const banner = user.bannerURL({ forceStatic: false, size: 2048 });
    if (banner) userInfo.setImage(banner).addFields({
        name: 'Banner',
        value: 'Look below:',
    });

    return userInfo;
}
