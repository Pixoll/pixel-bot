"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['view', 'set'],
        default: 'view',
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'channel',
        prompt: 'On what channel do you want the welcomes?',
        type: 'text-channel',
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            return subCommand !== 'set';
        },
    }, {
        key: 'message',
        label: 'message',
        prompt: 'What message should the bot send?',
        type: 'string',
        max: 1024,
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            return subCommand !== 'set';
        },
    }];
class WelcomeCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'welcome',
            group: 'managing',
            description: 'Setup welcoming messages that can be sent in DMs and in a specific channel of your server.',
            details: (0, common_tags_1.stripIndent) `
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
                You can use the following fields, which will be replaced when the welcome message is sent:
                **>** **{user}:** Tags the new member with a mention.
                **>** **{server_name}:** This server's name.
                **>** **{member_count}:** The member count of this server.
            `,
            format: (0, common_tags_1.stripIndent) `
                welcome <view> - Display the current welcome message.
                welcome set [text-channel] [message] - Set/update the welcomes to a channel.
            `,
            examples: ['welcome #welcome Thanks for joining {server_name}! We hope you a great stay here <3'],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'Display the current welcome message.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'set',
                    description: 'Set/update the welcomes to a channel.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Channel,
                            channelTypes: [discord_js_1.ChannelType.GuildText],
                            name: 'channel',
                            description: 'The channel where the welcome messages should be sent.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'message',
                            description: 'The message to send.',
                            required: true,
                        }],
                }],
        });
    }
    async run(context, { subCommand, channel, message }) {
        const data = await context.guild.database.welcome.fetch();
        switch (subCommand) {
            case 'view':
                return await this.runView(context, data);
            case 'set':
                return await this.runSet(context, data, channel, message);
        }
    }
    async runView(context, data) {
        if (!data) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There\'s no welcome message saved for this server. Use the `set` sub-command to set one.',
            }));
            return;
        }
        const { guild } = context;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${guild.name}'s welcome message`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .addFields({
            name: `Sent in <#${data.channel}>`,
            value: data.message.replace(/\{[\w_]+\}/g, '`$&`'),
        })
            .setTimestamp();
        await (0, utils_1.replyAll)(context, embed);
    }
    async runSet(context, data, channel, message) {
        if (!channel || !message)
            return;
        const { guild, guildId } = context;
        const db = guild.database.welcome;
        if (data) {
            await db.update(data, {
                channel: channel.id,
                message: message,
            });
        }
        else {
            await db.add({
                guild: guildId,
                channel: channel.id,
                message: message,
            });
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'The message has been successfully saved.',
        }));
    }
}
exports.default = WelcomeCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsY29tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy93ZWxjb21lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUFxRjtBQUNyRixxREFReUI7QUFDekIsdUNBQWtFO0FBRWxFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUN0QixPQUFPLEVBQUUsTUFBTTtRQUNmLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsU0FBUztRQUNkLE1BQU0sRUFBRSwyQ0FBMkM7UUFDbkQsSUFBSSxFQUFFLGNBQWM7UUFDcEIsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBVSxFQUFFLE9BQXdCO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sVUFBVSxLQUFLLEtBQUssQ0FBQztRQUNoQyxDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxTQUFTO1FBQ2QsS0FBSyxFQUFFLFNBQVM7UUFDaEIsTUFBTSxFQUFFLG1DQUFtQztRQUMzQyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxJQUFJO1FBQ1QsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBVSxFQUFFLE9BQXdCO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLENBQUMsQ0FBQztZQUN0RCxPQUFP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