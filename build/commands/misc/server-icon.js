"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
            .setColor(utils_1.pixelColor)
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
        await (0, utils_1.replyAll)(context, { embeds: [embed], components: [row] });
    }
}
exports.default = ServerIconCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLWljb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9zZXJ2ZXItaWNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUF3RjtBQUN4RixxREFBMEU7QUFDMUUsdUNBQW1EO0FBRW5ELE1BQXFCLGlCQUFrQixTQUFRLHlCQUFhO0lBQ3hELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsYUFBYTtZQUNuQixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQ2hDLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLDhCQUE4QjtZQUMzQyxTQUFTLEVBQUUsSUFBSTtZQUNmLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkI7UUFDMUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUUxQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFJLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUM3RDtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsa0JBQVUsQ0FBQzthQUNwQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDaEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO1NBQzlELENBQUM7YUFDRCxRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ2pCLFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sR0FBRyxHQUFHLElBQUksNkJBQWdCLEVBQWlCO2FBQzVDLGFBQWEsQ0FBQyxJQUFJLDBCQUFhLEVBQUU7YUFDN0IsUUFBUSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDO2FBQzFCLFFBQVEsQ0FBQyxVQUFVLENBQUM7YUFDcEIsTUFBTSxDQUFDLE9BQWlCLENBQUMsQ0FDN0IsQ0FBQztRQUVOLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRSxDQUFDO0NBQ0o7QUF0Q0Qsb0NBc0NDIn0=