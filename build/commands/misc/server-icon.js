"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
class ServerIconCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'server-icon',
            aliases: ['servericon', 'sicon'],
            group: 'misc',
            description: 'Displays the server\'s icon.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        let iconUrl = guild.iconURL({ forceStatic: false, size: 2048 });
        if (iconUrl && /\.webp/.test(iconUrl)) {
            iconUrl = guild.iconURL({ extension: 'png', size: 2048 });
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setImage(iconUrl)
            .setTimestamp();
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Link)
            .setLabel('Download')
            .setURL(iconUrl));
        await (0, functions_1.replyAll)(context, { embeds: [embed], components: [row] });
    }
}
exports.default = ServerIconCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLWljb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9zZXJ2ZXItaWNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUF3RjtBQUN4RixxREFBMEU7QUFDMUUscURBQWlEO0FBRWpELE1BQXFCLGlCQUFrQixTQUFRLHlCQUFhO0lBQ3hELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsYUFBYTtZQUNuQixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQ2hDLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLDhCQUE4QjtZQUMzQyxTQUFTLEVBQUUsSUFBSTtZQUNmLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkI7UUFDMUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUUxQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFJLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUM3RDtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNoQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDakIsWUFBWSxFQUFFLENBQUM7UUFFcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSw2QkFBZ0IsRUFBaUI7YUFDNUMsYUFBYSxDQUFDLElBQUksMEJBQWEsRUFBRTthQUM3QixRQUFRLENBQUMsd0JBQVcsQ0FBQyxJQUFJLENBQUM7YUFDMUIsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUNwQixNQUFNLENBQUMsT0FBaUIsQ0FBQyxDQUM3QixDQUFDO1FBRU4sTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDSjtBQXRDRCxvQ0FzQ0MifQ==