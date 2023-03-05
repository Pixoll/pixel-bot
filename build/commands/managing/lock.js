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
            details: (0, common_tags_1.stripIndent) `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy9sb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RDtBQUN4RCxxREFBNkY7QUFDN0YsdUNBQW1EO0FBRW5ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsU0FBUztRQUNkLE1BQU0sRUFBRSxtQ0FBbUM7UUFDM0MsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQztRQUN2QyxRQUFRLEVBQUUsS0FBSztLQUNsQixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsa0VBQWtFO1FBQzFFLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUseUJBQXlCO0tBQ3JDLENBQVUsQ0FBQztBQUtaLE1BQXFCLFdBQVksU0FBUSx5QkFBc0I7SUFDM0QsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLDBFQUEwRTtZQUN2RixPQUFPLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHbkI7WUFDRCxNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLFFBQVEsRUFBRSxDQUFDLG1DQUFtQyxDQUFDO1lBQy9DLGlCQUFpQixFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDckMsZUFBZSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDbkMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBYztRQUMzRSxNQUFNLGFBQWEsR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssd0JBQVcsQ0FBQyxpQkFBaUIsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDbEYsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLDhEQUE4RDthQUM5RSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUNELE1BQU0sS0FBSyx5QkFBeUIsQ0FBQztRQUVyQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNuQyxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsb0JBQW9CLENBQUM7UUFDdkQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFFakMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN6QyxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsR0FBRyxhQUFhLENBQUMsUUFBUSxFQUFFLHFCQUFxQjthQUNoRSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDdEQsTUFBTSxFQUFFLHVCQUF1QixJQUFJLENBQUMsSUFBSSxZQUFZO1lBQ3BELElBQUksRUFBRSwwQkFBYSxDQUFDLElBQUk7U0FDM0IsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxDQUFDLElBQUEsa0JBQVUsRUFBQztvQkFDaEIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsU0FBUyxFQUFFLDhCQUE4QjtvQkFDekMsVUFBVSxFQUFFLE1BQU07aUJBQ3JCLENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7WUFDL0IsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxVQUFVLGFBQWEsQ0FBQyxRQUFRLEVBQUUsR0FBRztTQUNyRCxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQWhFRCw4QkFnRUMifQ==