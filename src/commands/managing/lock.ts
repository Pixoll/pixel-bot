import { stripIndent } from 'common-tags';
import { ChannelType, OverwriteType } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, replyAll } from '../../utils';

const args = [{
    key: 'channel',
    prompt: 'What channel do you want to lock?',
    type: ['text-channel', 'voice-channel'],
    required: false,
}, {
    key: 'reason',
    prompt: 'What message do you want to send when the channel get\'s locked?',
    type: 'string',
    max: 512,
    default: 'We\'ll be back shortly.',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class LockCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'lock',
            group: 'managing',
            description: 'Locks a channel, revoking the `Send Messages` permission from @everyone.',
            detailedDescription: stripIndent`
                \`channel\` can be either a channel's name, mention or ID.
                If \`reason\` is not specified, it will default as "We\'ll be back shortly".
            `,
            format: 'lock [channel] <reason>',
            examples: ['lock #chat We\'ll be back shortly'],
            clientPermissions: ['ManageChannels'],
            userPermissions: ['ManageChannels'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { channel, reason }: ParsedArgs): Promise<void> {
        const targetChannel = channel ?? context.channel;
        if (targetChannel.type === ChannelType.GuildAnnouncement || targetChannel.isThread()) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'The current/targeted channel is not a text or voice channel.',
            }));
            return;
        }
        reason ??= 'We\'ll be back shortly.';

        const { guildId, guild } = context;
        const permissions = targetChannel.permissionOverwrites;
        const { everyone } = guild.roles;

        const perms = permissions.resolve(guildId);
        if (perms && perms.deny.has('SendMessages')) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: `${targetChannel.toString()} is already locked.`,
            }));
            return;
        }

        await permissions.edit(everyone, { SendMessages: false }, {
            reason: `Locked channel via "${this.name}" command.`,
            type: OverwriteType.Role,
        });
        await targetChannel.send({
            embeds: [basicEmbed({
                emoji: '\\🔒',
                fieldName: 'This channel has been locked',
                fieldValue: reason,
            })],
        });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Locked ${targetChannel.toString()}.`,
        }));
    }
}
