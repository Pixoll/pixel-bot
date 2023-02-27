"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
/** Sends a message when the bot joins a guild. */
async function default_1(client) {
    client.on('commandoGuildCreate', async (guild) => {
        client.emit('debug', 'Running "client/join-message".');
        const { user, owners, prefix, options } = client;
        const { channels, id } = guild;
        const owner = owners?.[0];
        if (!owner)
            return;
        const channel = channels.cache
            .filter((channel) => {
            if (channel.type !== discord_js_1.ChannelType.GuildText)
                return false;
            const everyonePerms = channel.permissionOverwrites.resolve(id)?.allow;
            if (!everyonePerms)
                return false;
            const hasPermissions = everyonePerms.bitfield === 0n
                || everyonePerms.has(['SendMessages', 'ViewChannel']);
            return hasPermissions;
        })
            .sort((a, b) => a.rawPosition - b.rawPosition)
            .first()
            ?? await guild.fetchOwner().catch(() => null).then(m => m?.user.createDM().catch(() => null));
        if (!channel)
            return;
        const topgg = 'https://top.gg/bot/802267523058761759';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setTitle(`Thanks for adding ${user.username}!`)
            .setDescription('Here\'s some useful information about the bot.')
            .addFields({
            name: `${(0, functions_1.customEmoji)('info')} Using commands`,
            value: (0, common_tags_1.stripIndent) `
                To use a command type \`${prefix}<command>\`, \`/<command>\` or \`@${user.tag} <command>\`!
                For a list of all commands or general information, run \`/help\`.

                ${(0, common_tags_1.oneLine) `
                *Note: Slash commands should be your preference from now on, as prefixed commands will be
                deprecated on the upcoming months.*
                `}
                `,
        }, {
            name: '⚙ Setting up the bot',
            value: (0, common_tags_1.stripIndent) `
                ${(0, common_tags_1.oneLine) `
                To setup the bot just run \`/setup\`, this will setup every core setting for all modules of
                the bot. If you want to setup an specific module, just run \`/setup [module]\`, you can see
                the full list using \`/help setup\`.
                `}
                ${(0, common_tags_1.oneLine) `
                Afterwards, make sure to run \`/module toggle\` to toggle the modules/sub-modules you want to use
                in this server.
                `}

                ${(0, common_tags_1.oneLine) `
                *Note: All modules/sub-modules are disabled by default.
                Setup data will be deleted if the bot leaves the server.*
                `}
                `,
        }, {
            name: '🕒 Note about times and dates',
            value: (0, common_tags_1.oneLine) `
                The bot runs based off the **Coordinated Universal Time (UTC).** This means that when you used
                time-based commands, like \`timestamp\`, \`reminder\` or \`time\`, all of the times you specify
                will be based on UTC's time. For more information about the time system, please check **page 4**
                of the \`help\` command.
                `,
        }, {
            name: '🔗 Useful links',
            value: (0, common_tags_1.oneLine) `
                [Top.gg page](${topgg}) -
                [Support server](${options.serverInvite}) -
                [Invite the bot](${topgg}/invite) -
                [Vote here](${topgg}/vote)
                `,
        })
            .setFooter({
            text: `Created with ❤️ by ${owner.tag}`,
            iconURL: owner.displayAvatarURL({ forceStatic: false }),
        });
        await channel.send({ embeds: [embed] }).catch(() => null);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9pbi1tZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvY2xpZW50L2pvaW4tbWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCwyQ0FBdUQ7QUFFdkQscURBQW9EO0FBRXBELGtEQUFrRDtBQUNuQyxLQUFLLG9CQUFXLE1BQTRCO0lBQ3ZELE1BQU0sQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7UUFFdkQsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNqRCxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUUvQixNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU87UUFFbkIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUs7YUFDekIsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFrQyxFQUFFO1lBQ2hELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDekQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUM7WUFDdEUsSUFBSSxDQUFDLGFBQWE7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDakMsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLFFBQVEsS0FBSyxFQUFFO21CQUM3QyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDMUQsT0FBTyxjQUFjLENBQUM7UUFDMUIsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDO2FBQzdDLEtBQUssRUFBRTtlQUNMLE1BQU0sS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDbkQsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQ3ZDLENBQUM7UUFFTixJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFckIsTUFBTSxLQUFLLEdBQUcsdUNBQXVDLENBQUM7UUFFdEQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsUUFBUSxDQUFDLHFCQUFxQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7YUFDL0MsY0FBYyxDQUFDLGdEQUFnRCxDQUFDO2FBQ2hFLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxHQUFHLElBQUEsdUJBQVcsRUFBQyxNQUFNLENBQUMsaUJBQWlCO1lBQzdDLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7MENBQ1EsTUFBTSxxQ0FBcUMsSUFBSSxDQUFDLEdBQUc7OztrQkFHM0UsSUFBQSxxQkFBTyxFQUFBOzs7aUJBR1I7aUJBQ0E7U0FDSixFQUFFO1lBQ0MsSUFBSSxFQUFFLHNCQUFzQjtZQUM1QixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBO2tCQUNoQixJQUFBLHFCQUFPLEVBQUE7Ozs7aUJBSVI7a0JBQ0MsSUFBQSxxQkFBTyxFQUFBOzs7aUJBR1I7O2tCQUVDLElBQUEscUJBQU8sRUFBQTs7O2lCQUdSO2lCQUNBO1NBQ0osRUFBRTtZQUNDLElBQUksRUFBRSwrQkFBK0I7WUFDckMsS0FBSyxFQUFFLElBQUEscUJBQU8sRUFBQTs7Ozs7aUJBS2I7U0FDSixFQUFFO1lBQ0MsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixLQUFLLEVBQUUsSUFBQSxxQkFBTyxFQUFBO2dDQUNFLEtBQUs7bUNBQ0YsT0FBTyxDQUFDLFlBQVk7bUNBQ3BCLEtBQUs7OEJBQ1YsS0FBSztpQkFDbEI7U0FDSixDQUFDO2FBQ0QsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLHNCQUFzQixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ3ZDLE9BQU8sRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDMUQsQ0FBQyxDQUFDO1FBRVAsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUF0RkQsNEJBc0ZDIn0=