"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/** Handles all of the member logs. */
function default_1(client) {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const { guild, premiumSinceTimestamp: boostTime2, user, id } = newMember;
        const { premiumSinceTimestamp: boostTime1, partial } = oldMember;
        if (!guild.available || partial || boostTime1 === boostTime2)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'boosts');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/boosts".');
        const action = boostTime1 === null ? 'started' : 'stopped';
        const emoji = action === 'started' ? (0, utils_1.customEmoji)('boost') : '';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#f47fff')
            .setAuthor({
            name: user.tag,
            iconURL: newMember.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`${user.toString()} ${action} boosting ${emoji}`)
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();
        if (action === 'stopped' && boostTime1)
            embed.addFields({
                name: 'Boosted for',
                value: (0, utils_1.timestamp)(boostTime1, 'R'),
            });
        guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbG9ncy9ib29zdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBMEM7QUFFMUMsdUNBQTJFO0FBRTNFLHNDQUFzQztBQUN0QyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFO1FBQzFELE1BQU0sRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDekUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDakUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksT0FBTyxJQUFJLFVBQVUsS0FBSyxVQUFVO1lBQUUsT0FBTztRQUVyRSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsOEJBQThCLENBQUMsQ0FBQztRQUVyRCxNQUFNLE1BQU0sR0FBRyxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMzRCxNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFBLG1CQUFXLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUUvRCxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDZCxPQUFPLEVBQUUsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQzlELENBQUM7YUFDRCxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksTUFBTSxhQUFhLEtBQUssRUFBRSxDQUFDO2FBQ2hFLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDckMsWUFBWSxFQUFFLENBQUM7UUFFcEIsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLFVBQVU7WUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNwRCxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsS0FBSyxFQUFFLElBQUEsaUJBQVMsRUFBQyxVQUFVLEVBQUUsR0FBRyxDQUFDO2FBQ3BDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQS9CRCw0QkErQkMifQ==