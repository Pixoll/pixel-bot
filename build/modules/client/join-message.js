"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
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
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setTitle(`Thanks for adding ${user.username}!`)
            .setDescription('Here\'s some useful information about the bot.')
            .addFields({
            name: `${(0, utils_1.customEmoji)('info')} Using commands`,
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
            value: (0, common_tags_1.stripIndent) `
                ${(0, utils_1.hyperlink)('Privacy Policy', utils_1.privacyPolicyUrl)} -
                ${(0, utils_1.hyperlink)('Terms of Service', utils_1.termsOfServiceUrl)} -
                ${(0, utils_1.hyperlink)('Top.gg page', utils_1.topggUrl)} -
                ${(0, utils_1.hyperlink)('Support server', options.serverInvite ?? '')} -
                ${(0, utils_1.hyperlink)('Invite the bot', utils_1.topggUrl + '/invite')} -
                ${(0, utils_1.hyperlink)('Vote here', utils_1.topggUrl + '/vote')}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9pbi1tZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvY2xpZW50L2pvaW4tbWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCwyQ0FBb0U7QUFFcEUsdUNBQWdIO0FBRWhILGtEQUFrRDtBQUNuQyxLQUFLLG9CQUFXLE1BQTRCO0lBQ3ZELE1BQU0sQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7UUFFdkQsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNqRCxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUUvQixNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU87UUFFbkIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUs7YUFDekIsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUEwQixFQUFFO1lBQ3hDLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDekQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUM7WUFDdEUsSUFBSSxDQUFDLGFBQWE7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDakMsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLFFBQVEsS0FBSyxFQUFFO21CQUM3QyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7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