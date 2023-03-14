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
        await (0, utils_1.replyAll)(context, userInfo);
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const userInfo = await mapUserInfo(interaction, interaction.targetUser);
        await (0, utils_1.replyAll)(interaction, userInfo);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hvaXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy93aG9pcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUNyQywyQ0FBdUc7QUFDdkcscURBT3lCO0FBQ3pCLHVDQUE0RTtBQUU1RSxNQUFNLGtCQUFrQixHQUEyQztJQUMvRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixtQkFBbUIsRUFBRSxJQUFJO0lBQ3pCLGVBQWUsRUFBRSxrQ0FBa0M7SUFDbkQsZUFBZSxFQUFFLGtDQUFrQztJQUNuRCxrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCLFNBQVMsRUFBRSxpQ0FBaUM7SUFDNUMscUJBQXFCLEVBQUUsK0JBQStCO0lBQ3RELHFCQUFxQixFQUFFLGtDQUFrQztJQUN6RCxxQkFBcUIsRUFBRSwrQkFBK0I7SUFDdEQsT0FBTyxFQUFFLCtCQUErQjtJQUN4QyxxQkFBcUIsRUFBRSx1Q0FBdUM7SUFDOUQsV0FBVyxFQUFFLElBQUk7SUFDakIsT0FBTyxFQUFFLElBQUk7SUFDYixLQUFLLEVBQUUscUNBQXFDO0lBQzVDLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFdBQVcsRUFBRSx3RUFBd0U7SUFDckYsaUJBQWlCLEVBQUUsMENBQTBDO0NBQ2hFLENBQUM7QUFFRixNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFJLENBQUMsY0FBYyxDQUFDLHlCQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQzlGLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBOEMsQ0FDNUQsQ0FBQyxDQUFDO0FBRUgsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdEQUFnRDtRQUN4RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLFlBQWEsU0FBUSx5QkFBeUI7SUFDL0QsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztZQUNsQyxLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxpQ0FBaUM7WUFDOUMsbUJBQW1CLEVBQUUscURBQXFEO1lBQzFFLE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUMzQixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtZQUM5Qix1QkFBdUIsRUFBRSxDQUFDLG1DQUFzQixDQUFDLElBQUksQ0FBQztTQUN6RCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBYztRQUN0RSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxRCxNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsV0FBc0Q7UUFDbEYsTUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN4RSxNQUFNLElBQUEsZ0JBQVEsRUFBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNKO0FBM0JELCtCQTJCQztBQUVELEtBQUssVUFBVSxXQUFXLENBQ3RCLE9BQW1FLEVBQUUsSUFBVTtJQUUvRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTFCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUEsbUJBQVcsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXhELE1BQU0sV0FBVyxHQUF5QixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVELElBQUksS0FBSyxFQUFFO1FBQ1AsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLO1lBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3hFO0lBQ0QsSUFBSSxNQUFNLEVBQUUsWUFBWTtRQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBQSxtQkFBVyxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDakUsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUN2RCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUEsbUJBQVcsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3hDO0lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUV6RSxNQUFNLFFBQVEsR0FBRyxJQUFJLHlCQUFZLEVBQUU7U0FDOUIsUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUNuQixTQUFTLENBQUM7UUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUc7UUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1FBQ3RELEdBQUcsRUFBRSxNQUFNO0tBQ2QsQ0FBQztTQUNELFlBQVksQ0FBQyxNQUFNLENBQUM7U0FDcEIsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDckMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7U0FDMUMsWUFBWSxFQUFFLENBQUM7SUFFcEIsSUFBSSxNQUFNLEVBQUU7UUFDUixLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUU7WUFDL0YsTUFBTSxNQUFNLEdBQUcsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNuRSxNQUFNLEtBQUssR0FBRyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHO2dCQUM3QyxDQUFDLENBQUMsV0FBVyxJQUFBLGlCQUFTLEVBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JELENBQUMsQ0FBQyxHQUFHLElBQUEsb0JBQVEsRUFDVCxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQ3JELEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUNwQixPQUFPO2dCQUNSLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFWCxJQUFJLElBQUksS0FBSyx5QkFBWSxDQUFDLE1BQU0sSUFBSSxLQUFLO2dCQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUM7b0JBQzFELElBQUksRUFBRSxnQkFBZ0I7b0JBQ3RCLEtBQUssRUFBRSxLQUFLO2lCQUNmLENBQUMsQ0FBQztZQUNILElBQUksSUFBSSxLQUFLLHlCQUFZLENBQUMsU0FBUyxJQUFJLEdBQUc7Z0JBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQztvQkFDM0QsSUFBSSxFQUFFLGFBQWEsSUFBSSxFQUFFO29CQUN6QixLQUFLLEVBQUUsR0FBRztpQkFDYixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsc0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUNuQix5QkFBWSxDQUFDLFNBQVMsRUFBRSx5QkFBWSxDQUFDLE1BQU0sRUFBRSx5QkFBWSxDQUFDLFNBQVM7YUFDdEUsQ0FBQztnQkFBRSxRQUFRLENBQUMsU0FBUyxDQUFDO29CQUNuQixJQUFJLEVBQUUsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO29CQUN4QyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLFFBQVE7aUJBQzVELENBQUMsQ0FBQztTQUNOO1FBRUQsSUFBSSxNQUFNLENBQUMsZUFBZTtZQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUM7Z0JBQzNDLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxJQUFBLGlCQUFTLEVBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO2dCQUNuRCxNQUFNLEVBQUUsSUFBSTthQUNmLENBQUMsQ0FBQztLQUNOO0lBRUQsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUNmLElBQUksRUFBRSxZQUFZO1FBQ2xCLEtBQUssRUFBRSxJQUFBLGlCQUFTLEVBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7UUFDbEQsTUFBTSxFQUFFLElBQUk7S0FDZixDQUFDLENBQUM7SUFFSCxJQUFJLE1BQU0sRUFBRTtRQUNSLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxPQUFPLEtBQUssTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYztZQUNqRSxDQUFDLENBQUMsV0FBVyxLQUFLLGVBQWUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDM0QsSUFBSSxlQUFlO1lBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQztnQkFDcEMsSUFBSSxFQUFFLGlCQUFpQjtnQkFDdkIsS0FBSyxFQUFFLGVBQWU7Z0JBQ3RCLE1BQU0sRUFBRSxJQUFJO2FBQ2YsQ0FBQyxDQUFDO0tBQ047SUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNsRSxJQUFJLE1BQU07UUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM1QyxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxhQUFhO1NBQ3ZCLENBQUMsQ0FBQztJQUVILE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUMifQ==