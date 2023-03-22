"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const userFlagToEmojiMap = {
    ActiveDeveloper: null,
    BotHTTPInteractions: null,
    BugHunterLevel1: '<:bug_hunter:894117053714292746>',
    BugHunterLevel2: '<:bug_buster:894117053856878592>',
    CertifiedModerator: null,
    Hypesquad: '<:hypesquad:894113047763898369>',
    HypeSquadOnlineHouse1: '<:bravery:894110822786281532>',
    HypeSquadOnlineHouse2: '<:brilliance:894110822626885663>',
    HypeSquadOnlineHouse3: '<:balance:894110823553855518>',
    Partner: '<:partner:894116243785785344>',
    PremiumEarlySupporter: '<:early_supporter:894117997264896080>',
    Quarantined: null,
    Spammer: null,
    Staff: '<:discord_staff:894115772832546856>',
    TeamPseudoUser: null,
    VerifiedBot: '<:verified_bot1:894251987087016006><:verified_bot2:894251987661647873>',
    VerifiedDeveloper: '<:verified_developer:894117997378142238>',
};
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
            description.push(userFlagToEmojiMap[flag]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hvaXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy93aG9pcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUNyQywyQ0FBdUc7QUFDdkcscURBT3lCO0FBQ3pCLHVDQUFxRjtBQUVyRixNQUFNLGtCQUFrQixHQUEyQztJQUMvRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLGVBQWUsRUFBRSxrQ0FBa0M7SUFDbkQsZUFBZSxFQUFFLGtDQUFrQztJQUNuRCxrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCLFNBQVMsRUFBRSxpQ0FBaUM7SUFDNUMscUJBQXFCLEVBQUUsK0JBQStCO0lBQ3RELHFCQUFxQixFQUFFLGtDQUFrQztJQUN6RCxxQkFBcUIsRUFBRSwrQkFBK0I7SUFDdEQsT0FBTyxFQUFFLCtCQUErQjtJQUN4QyxxQkFBcUIsRUFBRSx1Q0FBdUM7SUFDOUQsV0FBVyxFQUFFLElBQUk7SUFDakIsT0FBTyxFQUFFLElBQUk7SUFDYixLQUFLLEVBQUUscUNBQXFDO0lBQzVDLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFdBQVcsRUFBRSx3RUFBd0U7SUFDckYsaUJBQWlCLEVBQUUsMENBQTBDO0NBQ2hFLENBQUM7QUFFRixNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFJLENBQUMsY0FBYyxDQUFDLHlCQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQzlGLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBOEMsQ0FDNUQsQ0FBQyxDQUFDO0FBRUgsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdEQUFnRDtRQUN4RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztB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