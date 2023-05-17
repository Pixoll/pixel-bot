"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const activityTypeMap = Object.fromEntries(pixoll_commando_1.Util.getEnumEntries(discord_js_1.ActivityType).map(([key, value]) => [value, key]));
const args = [{
        key: 'user',
        prompt: 'What user do you want to get information from?',
        type: 'user',
        required: false,
    }];
class WhoIsCommand extends pixoll_commando_1.Command {
    constructor(client) {
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
            contextMenuCommandTypes: [discord_js_1.ApplicationCommandType.User],
        });
    }
    async run(context, { user: passedUser }) {
        const user = await (passedUser ?? context.author).fetch();
        const userInfo = await mapUserInfo(context, user);
        await (0, utils_1.reply)(context, userInfo);
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const userInfo = await mapUserInfo(interaction, interaction.targetUser);
        await (0, utils_1.reply)(interaction, userInfo);
    }
}
exports.default = WhoIsCommand;
async function mapUserInfo(context, user) {
    const { guild } = context;
    const flags = await user.fetchFlags().catch(() => null);
    const member = await guild?.members.fetch(user).catch(() => null);
    const permissions = member ? (0, utils_1.getKeyPerms)(member) : null;
    const description = [user.toString()];
    if (flags) {
        for (const flag of flags)
            description.push(utils_1.userFlagToEmojiMap[flag]);
    }
    if (member?.premiumSince)
        description.push((0, utils_1.customEmoji)('boost'));
    if (!flags?.toArray().includes('VerifiedBot') && user.bot) {
        description.push((0, utils_1.customEmoji)('bot'));
    }
    const avatar = user.displayAvatarURL({ forceStatic: false, size: 2048 });
    const userInfo = new discord_js_1.EmbedBuilder()
        .setColor(utils_1.pixelColor)
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
                ? `Started ${(0, utils_1.timestamp)(timestamps.start, 'R', true)}`
                : `${(0, better_ms_1.prettyMs)(timestamps.end.getTime() - timestamps.start.getTime(), { verbose: true })} left`
                : null;
            if (type === discord_js_1.ActivityType.Custom && state)
                userInfo.addFields({
                    name: 'Custom status:',
                    value: state,
                });
            if (type === discord_js_1.ActivityType.Streaming && url)
                userInfo.addFields({
                    name: `Streaming ${name}`,
                    value: url,
                });
            if (!pixoll_commando_1.Util.equals(type, [
                discord_js_1.ActivityType.Competing, discord_js_1.ActivityType.Custom, discord_js_1.ActivityType.Streaming,
            ]))
                userInfo.addFields({
                    name: `${activityTypeMap[type]} ${name}`,
                    value: status ? `${status}\n${times}` : times ?? '\u200B',
                });
        }
        if (member.joinedTimestamp)
            userInfo.addFields({
                name: 'Joined',
                value: (0, utils_1.timestamp)(member.joinedTimestamp, 'R', true),
                inline: true,
            });
    }
    userInfo.addFields({
        name: 'Registered',
        value: (0, utils_1.timestamp)(user.createdTimestamp, 'R', true),
        inline: true,
    });
    if (member) {
        const acknowledgement = guild?.ownerId === member.id ? 'Server owner'
            : permissions === 'Administrator' ? permissions : null;
        if (acknowledgement)
            userInfo.addFields({
                name: 'Acknowledgement',
                value: acknowledgement,
                inline: true,
            });
    }
    const banner = user.bannerURL({ forceStatic: false, size: 2048 });
    if (banner)
        userInfo.setImage(banner).addFields({
            name: 'Banner',
            value: 'Look below:',
        });
    return userInfo;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hvaXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy93aG9pcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUNyQywyQ0FBc0Y7QUFDdEYscURBUXlCO0FBQ3pCLHVDQUF5RztBQUV6RyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFJLENBQUMsY0FBYyxDQUFDLHlCQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQzlGLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBOEMsQ0FDNUQsQ0FBQyxDQUFDO0FBRUgsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdEQUFnRDtRQUN4RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsWUFBYSxTQUFRLHlCQUF5QjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO1lBQ2xDLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLGlDQUFpQztZQUM5QyxtQkFBbUIsRUFBRSxxREFBcUQ7WUFDMUUsTUFBTSxFQUFFLGVBQWU7WUFDdkIsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQzNCLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1lBQzlCLHVCQUF1QixFQUFFLENBQUMsbUNBQXNCLENBQUMsSUFBSSxDQUFDO1NBQ3pELENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFjO1FBQ3RFLE1B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