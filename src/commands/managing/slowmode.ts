import { prettyMs } from 'better-ms';
import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    ReadonlyArgumentInfo,
} from 'pixoll-commando';
import { reply, basicEmbed } from '../../utils';

const args = [{
    key: 'rateLimit',
    prompt: 'What will be the channel\'s new rate limit?',
    type: ['duration', 'string'],
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const durationType = message.client.registry.types.get('duration');
        const isValid = await durationType?.validate(value, message, argument) ?? true;
        if (isValid !== true) return isValid;
        return value === 'off';
    },
}, {
    key: 'channel',
    prompt: 'In what channel do you want to change the rate limit?',
    type: ['text-channel', 'thread-channel', 'voice-channel'],
    required: false,
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    rateLimit: number | 'off';
};

export default class SlowmodeCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'slowmode',
            aliases: ['ratelimit'],
            group: 'managing',
            description: 'Enable, change or disable slowmode/rate limit on a channel.',
            detailedDescription: stripIndent`
                \`channel\` can be either a channel's name, mention or ID.
                \`time\` uses the bot's time formatting, for more information use the \`help\` command.
                Setting \`time\` as \`0\` or \`off\` will disable the slowmode on the specified channel.
            `,
            format: 'slowmode [channel] [time]',
            examples: [
                'slowmode #main-chat 3s',
                'slowmode commands off',
            ],
            clientPermissions: ['ManageChannels'],
            userPermissions: ['ManageChannels'],
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Integer,
                name: 'rate-limit',
                description: 'The channel\'s new rate limit, in seconds.',
                required: true,
            }, {
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [
                    ChannelType.AnnouncementThread,
                    ChannelType.GuildText,
                    ChannelType.PrivateThread,
                    ChannelType.PublicThread,
                ],
                name: 'channel',
                description: 'The channel to change its rate limit.',
            }],
        });
    }

    public async run(context: CommandContext<true>, { channel, rateLimit }: ParsedArgs): Promise<void> {
        rateLimit = parseRateLimit(context, rateLimit);
        const targetChannel = channel ?? context.channel;
        if (targetChannel.type === ChannelType.GuildAnnouncement) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'The current/targeted channel is not a text, thread or voice channel.',
            }));
            return;
        }

        if (targetChannel.rateLimitPerUser === rateLimit) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'The slowmode is already set to that value.',
            }));
            return;
        }

        await targetChannel.setRateLimitPerUser(rateLimit, `Rate-limited channel via "${this.name}" command.`);

        if (rateLimit === 0) {
            await reply(context, basicEmbed({
                color: 'Green',
                emoji: 'check',
                description: `Disabled slowmode in ${targetChannel.toString()}`,
            }));
            return;
        }

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Changed slowmode in ${targetChannel.toString()}`,
            fieldValue: `**New rate limit:** ${prettyMs(rateLimit * 1000, { verbose: true })}`,
        }));
    }
}

function parseRateLimit(context: CommandContext, rateLimit: ParsedArgs['rateLimit']): number {
    if (rateLimit === 'off') return 0;
    if (context.isMessage()) return Math.trunc(rateLimit / 1000);
    return Math.trunc(rateLimit);
}
