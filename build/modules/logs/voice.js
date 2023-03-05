"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const channelTypeMap = {
    [discord_js_1.ChannelType.GuildStageVoice]: 'Stage',
    [discord_js_1.ChannelType.GuildVoice]: 'Voice',
};
/** Handles all of the voice logs. */
function default_1(client) {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { guild, member, id } = oldState;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'voice');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/voice".');
        const { channel: channel1, serverMute: mute1, serverDeaf: deaf1 } = oldState;
        const { channel: channel2, serverMute: mute2, serverDeaf: deaf2 } = newState;
        const { user } = member ?? {};
        if (!user)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();
        if (!channel1 && channel2) {
            embed.setColor('Green')
                .setDescription(`${user.toString()} joined ${channelTypeMap[channel2.type]} channel ${channel2.toString()}`);
        }
        if (!channel2 && channel1) {
            embed.setColor('Orange')
                .setDescription(`${user.toString()} left ${channelTypeMap[channel1.type]} channel ${channel1.toString()}`);
        }
        if (channel1 && channel2 && channel1.id !== channel2.id)
            embed.addFields({
                name: `Switched ${channelTypeMap[channel1.type]} channels`,
                value: `${channel1.toString()} ➜ ${channel2.toString()}`,
            });
        if (typeof mute1 === 'boolean' && typeof mute2 === 'boolean' && mute1 !== mute2) {
            embed.setDescription(`${user.toString()} has been server ${mute2 ? 'muted' : 'unmuted'}`);
        }
        if (typeof deaf1 === 'boolean' && typeof deaf2 === 'boolean' && deaf1 !== deaf2) {
            embed.setDescription(`${user.toString()} has been server ${deaf2 ? 'deafened' : 'undeafened'}`);
        }
        if (embed.data.description || embed.data.fields?.length !== 0) {
            guild.queuedLogs.push(embed);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL3ZvaWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQStFO0FBRS9FLHVDQUFtRDtBQUVuRCxNQUFNLGNBQWMsR0FBMkM7SUFDM0QsQ0FBQyx3QkFBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFLE9BQU87SUFDdEMsQ0FBQyx3QkFBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU87Q0FDcEMsQ0FBQztBQUVGLHFDQUFxQztBQUNyQyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFO1FBQ3ZELE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUV2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUVwRCxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDN0UsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEdBQUcsUUFBUSxDQUFDO1FBQzdFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTztRQUVsQixNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNoQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3pELENBQUM7YUFDRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQ3JDLFlBQVksRUFBRSxDQUFDO1FBRXBCLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxFQUFFO1lBQ3ZCLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2lCQUNsQixjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3BIO1FBRUQsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLEVBQUU7WUFDdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7aUJBQ25CLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDbEg7UUFFRCxJQUFJLFFBQVEsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRTtZQUFFLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ3JFLElBQUksRUFBRSxZQUFZLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQzFELEtBQUssRUFBRSxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUU7YUFDM0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7WUFDN0UsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQzdGO1FBRUQsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7WUFDN0UsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1NBQ25HO1FBRUQsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNELEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBbERELDRCQWtEQyJ9