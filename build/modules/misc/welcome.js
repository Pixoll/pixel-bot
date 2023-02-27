"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
/** This module manages welcome messages. */
function default_1(client) {
    client.on('guildMemberAdd', async ({ guild, user }) => {
        if (user.bot)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'welcome');
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
            .setColor('#4c9f4c')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VsY29tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL21pc2Mvd2VsY29tZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUE4RTtBQUU5RSxxREFBNkQ7QUFFN0QsNENBQTRDO0FBQzVDLG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ2xELElBQUksSUFBSSxDQUFDLEdBQUc7WUFBRSxPQUFPO1FBRXJCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxnQ0FBb0IsRUFBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7UUFFekQsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU87UUFFbEIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBaUMsQ0FBQztRQUVyRixNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQVcsRUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQzFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ3JDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFOUQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLGNBQWMsS0FBSyxDQUFDLElBQUksR0FBRztZQUNqQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxDQUFDO2FBQ3RDLFlBQVksRUFBRSxDQUFDO1FBRXBCLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssd0JBQVcsQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN6RSxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNyRTtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWhDRCw0QkFnQ0MifQ==