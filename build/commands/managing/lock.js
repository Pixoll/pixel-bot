"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
    }];
class LockCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'lock',
            group: 'managing',
            description: 'Locks a channel, revoking the `Send Messages` permission from @everyone.',
            detailedDescription: (0, common_tags_1.stripIndent) `
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
    async run(context, { channel, reason }) {
        const targetChannel = channel ?? context.channel;
        if (targetChannel.type === discord_js_1.ChannelType.GuildAnnouncement || targetChannel.isThread()) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: `${targetChannel.toString()} is already locked.`,
            }));
            return;
        }
        await permissions.edit(everyone, { SendMessages: false }, {
            reason: `Locked channel via "${this.name}" command.`,
            type: discord_js_1.OverwriteType.Role,
        });
        await targetChannel.send({
            embeds: [(0, utils_1.basicEmbed)({
                    emoji: '\\🔒',
                    fieldName: 'This channel has been locked',
                    fieldValue: reason,
                })],
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Locked ${targetChannel.toString()}.`,
        }));
    }
}
exports.default = LockCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy9sb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RDtBQUN4RCxxREFBNkY7QUFDN0YsdUNBQW1EO0FBRW5ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsU0FBUztRQUNkLE1BQU0sRUFBRSxtQ0FBbUM7UUFDM0MsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQztRQUN2QyxRQUFRLEVBQUUsS0FBSztLQUNsQixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsa0VBQWtFO1FBQzFFLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUseUJBQXlCO0tBQ3JDLENBQVUsQ0FBQztBQUtaLE1BQXFCLFdBQVksU0FBUSx5QkFBc0I7SUFDM0QsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLDBFQUEwRTtZQUN2RixtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUcvQjtZQUNELE1BQU0sRUFBRSx5QkFBeUI7WUFDakMsUUFBUSxFQUFFLENBQUMsbUNBQW1DLENBQUM7WUFDL0MsaUJBQWlCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNyQyxlQUFlLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNuQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFjO1FBQzNFLE1BQU0sYUFBYSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2pELElBQUksYUFBYSxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLGlCQUFpQixJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNsRixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsOERBQThEO2FBQzlFLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBQ0QsTUFBTSxLQUFLLHlCQUF5QixDQUFDO1FBRXJDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ25DLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQztRQUN2RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUVqQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUscUJBQXFCO2FBQ2hFLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN0RCxNQUFNLEVBQUUsdUJBQXVCLElBQUksQ0FBQyxJQUFJLFlBQVk7WUFDcEQsSUFBSSxFQUFFLDBCQUFhLENBQUMsSUFBSTtTQUMzQixDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDckIsTUFBTSxFQUFFLENBQUMsSUFBQSxrQkFBVSxFQUFDO29CQUNoQixLQUFLLEVBQUUsTUFBTTtvQkFDYixTQUFTLEVBQUUsOEJBQThCO29CQUN6QyxVQUFVLEVBQUUsTUFBTTtpQkFDckIsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLFVBQVUsYUFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHO1NBQ3JELENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBaEVELDhCQWdFQyJ9