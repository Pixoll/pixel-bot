"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/** This module manages welcome messages. */
function default_1(client) {
    client.on('guildMemberAdd', async ({ guild, user }) => {
        if (user.bot)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'welcome');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "modules/welcome".');
        const data = await guild.database.welcome.fetch();
        if (!data)
            return;
        const channel = guild.channels.resolve(data.channel);
        const format = (str) => str.replace(/{user}/g, user.toString())
            .replace(/{server_name}/g, guild.name)
            .replace(/{member_count}/g, guild.memberCount.toString());
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `Welcome to ${guild.name}!`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setFooter({ text: 'Enjoy your stay' })
            .setTimestamp();
        if (channel && channel.type !== discord_js_1.ChannelType.GuildStageVoice && data.message) {
            embed.setDescription(format(data.message));
            await channel.send({ content: user.toString(), embeds: [embed] });
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsY29tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL21pc2Mvd2VsY29tZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUE4RTtBQUU5RSx1Q0FBK0Q7QUFFL0QsNENBQTRDO0FBQzVDLG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ2xELElBQUksSUFBSSxDQUFDLEdBQUc7WUFBRSxPQUFPO1FBRXJCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSw0QkFBb0IsRUFBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7UUFFekQsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU87UUFFbEIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBaUMsQ0FBQztRQUVyRixNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQVcsRUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQzFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ3JDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFOUQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxrQkFBVSxDQUFDO2FBQ3BCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxjQUFjLEtBQUssQ0FBQyxJQUFJLEdBQUc7WUFDakMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO1NBQzlELENBQUM7YUFDRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQzthQUN0QyxZQUFZLEVBQUUsQ0FBQztRQUVwQixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDekUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDckU7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFoQ0QsNEJBZ0NDIn0=