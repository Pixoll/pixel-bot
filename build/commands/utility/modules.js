"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
function getStatusString(isOn) {
    if (isOn === true)
        return `Enabled ${(0, utils_1.customEmoji)('online')}`;
    return `Disabled ${(0, utils_1.customEmoji)('dnd')}`;
}
function mapModuleData(data) {
    return Object.entries(pixoll_commando_1.Util.omit(data, [
        '_id', 'guild',
    ])).sort(([key1], [key2, value]) => typeof value === 'boolean' ? (0, utils_1.alphabeticalOrder)()(key1, key2) : -1).map(([key, value]) => {
        if (typeof value === 'boolean') {
            return `**${pixoll_commando_1.Util.capitalize((0, utils_1.camelToKebabCase)(key).replace(/-/g, ' '))}:** ${getStatusString(value)}`;
        }
        return [`**${pixoll_commando_1.Util.capitalize((0, utils_1.camelToKebabCase)(key).replace(/-/g, ' '))}:**`, Object.entries(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            value ?? {}).map(([nestedKey, nestedValue]) => `\u2800⤷ **${pixoll_commando_1.Util.capitalize((0, utils_1.camelToKebabCase)(nestedKey))}:** ${getStatusString(nestedValue)}`).join('\n')].join('\n');
    }).join('\n');
}
class ModulesCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'modules',
            group: 'utility',
            description: 'Check the status of all available modules and sub-modules.',
            modPermissions: true,
            guarded: true,
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const data = await guild.database.modules.fetch();
        if (!data) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }
        const modulesStatsString = mapModuleData(data);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${guild.name}'s modules and sub-modules`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(modulesStatsString)
            .setTimestamp();
        await (0, utils_1.reply)(context, embed);
    }
}
exports.default = ModulesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsaXR5L21vZHVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBMEM7QUFDMUMscURBQTZHO0FBQzdHLHVDQUE4RztBQUU5RyxTQUFTLGVBQWUsQ0FBQyxJQUFjO0lBQ25DLElBQUksSUFBSSxLQUFLLElBQUk7UUFBRSxPQUFPLFdBQVcsSUFBQSxtQkFBVyxFQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7SUFDN0QsT0FBTyxZQUFZLElBQUEsbUJBQVcsRUFBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQzVDLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUEwQztJQUM3RCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsc0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2xDLEtBQUssRUFBRSxPQUFPO0tBQ2pCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUMvQixPQUFPLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUEseUJBQWlCLEdBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM1RSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDbkIsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDNUIsT0FBTyxLQUFLLHNCQUFJLENBQUMsVUFBVSxDQUFDLElBQUEsd0JBQWdCLEVBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1NBQ3hHO1FBQ0QsT0FBTyxDQUFDLEtBQUssc0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBQSx3QkFBZ0IsRUFBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsT0FBTztZQUN2Rix5RUFBeUU7WUFDekUsS0FBSyxJQUFJLEVBQStCLENBQzNDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUMvQixhQUFhLHNCQUFJLENBQUMsVUFBVSxDQUFDLElBQUEsd0JBQWdCLEVBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FDakcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFFRCxNQUFxQixjQUFlLFNBQVEseUJBQWE7SUFDckQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLDREQUE0RDtZQUN6RSxjQUFjLEVBQUUsSUFBSTtZQUNwQixPQUFPLEVBQUUsSUFBSTtZQUNiLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QjtRQUMxQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsU0FBUyxFQUFFLDZDQUE2QztnQkFDeEQsVUFBVSxFQUFFLHVDQUF1QzthQUN0RCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9DLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsa0JBQVUsQ0FBQzthQUNwQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSw0QkFBNEI7WUFDL0MsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO1NBQzlELENBQUM7YUFDRCxjQUFjLENBQUMsa0JBQWtCLENBQUM7YUFDbEMsWUFBWSxFQUFFLENBQUM7UUFFcEIsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNKO0FBeENELGlDQXdDQyJ9