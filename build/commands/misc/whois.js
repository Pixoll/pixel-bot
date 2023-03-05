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
            details: '`user` has to be a user\'s username, ID or mention.',
            format: 'who-is <user>',
            examples: ['who-is Pixoll'],
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user: passedUser }) {
        const user = await (passedUser ?? context.author).fetch();
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
            .setColor('#4c9f4c')
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
                    ? `Started ${(0, utils_1.timestamp)(timestamps.start, 'R')}`
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
                    value: (0, utils_1.timestamp)(member.joinedTimestamp, 'R'),
                    inline: true,
                });
        }
        userInfo.addFields({
            name: 'Registered',
            value: (0, utils_1.timestamp)(user.createdTimestamp, 'R'),
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
        if (banner) {
            userInfo.setImage(banner).addFields({
                name: 'Banner',
                value: 'Look below:',
            });
        }
        await (0, utils_1.replyAll)(context, userInfo);
    }
}
exports.default = WhoIsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hvaXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy93aG9pcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUNyQywyQ0FBeUU7QUFDekUscURBQW1HO0FBQ25HLHVDQUE0RTtBQUU1RSxNQUFNLGtCQUFrQixHQUEyQztJQUMvRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLGVBQWUsRUFBRSxrQ0FBa0M7SUFDbkQsZUFBZSxFQUFFLGtDQUFrQztJQUNuRCxrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCLFNBQVMsRUFBRSxpQ0FBaUM7SUFDNUMscUJBQXFCLEVBQUUsK0JBQStCO0lBQ3RELHFCQUFxQixFQUFFLGtDQUFrQztJQUN6RCxxQkFBcUIsRUFBRSwrQkFBK0I7SUFDdEQsT0FBTyxFQUFFLCtCQUErQjtJQUN4QyxxQkFBcUIsRUFBRSx1Q0FBdUM7SUFDOUQsV0FBVyxFQUFFLElBQUk7SUFDakIsT0FBTyxFQUFFLElBQUk7SUFDYixLQUFLLEVBQUUscUNBQXFDO0lBQzVDLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFdBQVcsRUFBRSx3RUFBd0U7SUFDckYsaUJBQWlCLEVBQUUsMENBQTBDO0NBQ2hFLENBQUM7QUFFRixNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFJLENBQUMsY0FBYyxDQUFDLHlCQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQzlGLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBOEMsQ0FDNUQsQ0FBQyxDQUFDO0FBRUgsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdEQUFnRDtRQUN4RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztB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