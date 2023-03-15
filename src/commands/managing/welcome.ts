import { stripIndent } from 'common-tags';
import { EmbedBuilder, ApplicationCommandOptionType, ChannelType } from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    CommandoTextChannel,
    JSONIfySchema,
    ParseRawArguments,
    WelcomeSchema,
} from 'pixoll-commando';
import { basicEmbed, getSubCommand, pixelColor, replyAll } from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'set'],
    default: 'view',
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'channel',
    prompt: 'On what channel do you want the welcomes?',
    type: 'text-channel',
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        return subCommand !== 'set';
    },
}, {
    key: 'message',
    label: 'message',
    prompt: 'What message should the bot send?',
    type: 'string',
    max: 1024,
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message);
        return subCommand !== 'set';
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
type SubCommand = ParsedArgs['subCommand'];

export default class WelcomeCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'welcome',
            group: 'managing',
            description: 'Setup welcoming messages that can be sent in DMs and in a specific channel of your server.',
            detailedDescription: stripIndent`
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
                You can use the following fields, which will be replaced when the welcome message is sent:
                **>** **{user}:** Tags the new member with a mention.
                **>** **{server_name}:** This server's name.
                **>** **{member_count}:** The member count of this server.
            `,
            format: stripIndent`
                welcome <view> - Display the current welcome message.
                welcome set [text-channel] [message] - Set/update the welcomes to a channel.
            `,
            examples: ['welcome #welcome Thanks for joining {server_name}! We hope you a great stay here <3'],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'Display the current welcome message.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'set',
                description: 'Set/update the welcomes to a channel.',
                options: [{
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    name: 'channel',
                    description: 'The channel where the welcome messages should be sent.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'message',
                    description: 'The message to send.',
                    required: true,
                }],
            }],
        });
    }

    public async run(context: CommandContext<true>, { subCommand, channel, message }: ParsedArgs): Promise<void> {
        const data = await context.guild.database.welcome.fetch();

        switch (subCommand) {
            case 'view':
                return await this.runView(context, data);
            case 'set':
                return await this.runSet(context, data, channel, message);
        }
    }

    protected async runView(context: CommandContext<true>, data: JSONIfySchema<WelcomeSchema> | null): Promise<void> {
        if (!data) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There\'s no welcome message saved for this server. Use the `set` sub-command to set one.',
            }));
            return;
        }

        const { guild } = context;
        const embed = new EmbedBuilder()
            .setColor(pixelColor)
            .setAuthor({
                name: `${guild.name}'s welcome message`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .addFields({
                name: `Sent in <#${data.channel}>`,
                value: data.message.replace(/\{[\w_]+\}/g, '`$&`'),
            })
            .setTimestamp();

        await replyAll(context, embed);
    }

    protected async runSet(
        context: CommandContext<true>,
        data: JSONIfySchema<WelcomeSchema> | null,
        channel: CommandoTextChannel | null,
        message: string | null
    ): Promise<void> {
        if (!channel || !message) return;

        const { guild, guildId } = context;
        const db = guild.database.welcome;
        if (data) {
            await db.update(data, {
                channel: channel.id,
                message: message,
            });
        } else {
            await db.add({
                guild: guildId,
                channel: channel.id,
                message: message,
            });
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'The message has been successfully saved.',
        }));
    }
}
