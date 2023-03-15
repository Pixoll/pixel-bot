"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
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
    ])).sort(([key1], [key2, value]) => typeof value === 'boolean' ? (0, utils_1.abcOrder)(key1, key2) : -1).map(([key, value]) => {
        if (typeof value === 'boolean') {
            return `**${(0, lodash_1.capitalize)((0, utils_1.addDashes)(key).replace(/-/g, ' '))}:** ${getStatusString(value)}`;
        }
        return [`**${(0, lodash_1.capitalize)((0, utils_1.addDashes)(key).replace(/-/g, ' '))}:**`, Object.entries(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            value ?? {}).map(([nestedKey, nestedValue]) => `\u2800⤷ **${(0, lodash_1.capitalize)((0, utils_1.addDashes)(nestedKey))}:** ${getStatusString(nestedValue)}`).join('\n')].join('\n');
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }
        const moduleStatsString = mapModuleData(data);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${guild.name}'s modules and sub-modules`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(moduleStatsString)
            .setTimestamp();
        await (0, utils_1.replyAll)(context, embed);
    }
}
exports.default = ModulesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsaXR5L21vZHVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBMEM7QUFDMUMsbUNBQW9DO0FBQ3BDLHFEQUE2RztBQUM3Ryx1Q0FBaUc7QUFFakcsU0FBUyxlQUFlLENBQUMsSUFBYztJQUNuQyxJQUFJLElBQUksS0FBSyxJQUFJO1FBQUUsT0FBTyxXQUFXLElBQUEsbUJBQVcsRUFBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0lBQzdELE9BQU8sWUFBWSxJQUFBLG1CQUFXLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBMEM7SUFDN0QsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNsQyxLQUFLLEVBQUUsT0FBTztLQUNqQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FDL0IsT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFBLGdCQUFRLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDekQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ25CLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQzVCLE9BQU8sS0FBSyxJQUFBLG1CQUFVLEVBQUMsSUFBQSxpQkFBUyxFQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztTQUM1RjtRQUNELE9BQU8sQ0FBQyxLQUFLLElBQUEsbUJBQVUsRUFBQyxJQUFBLGlCQUFTLEVBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDM0UseUVBQXlFO1lBQ3pFLEtBQUssSUFBSSxFQUErQixDQUMzQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FDL0IsYUFBYSxJQUFBLG1CQUFVLEVBQUMsSUFBQSxpQkFBUyxFQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sZUFBZSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQ3JGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBRUQsTUFBcUIsY0FBZSxTQUFRLHlCQUFhO0lBQ3JELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsU0FBUztZQUNmLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFdBQVcsRUFBRSw0REFBNEQ7WUFDekUsY0FBYyxFQUFFLElBQUk7WUFDcEIsT0FBTyxFQUFFLElBQUk7WUFDYixTQUFTLEVBQUUsSUFBSTtZQUNmLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkI7UUFDMUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUUxQixNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxTQUFTLEVBQUUsNkNBQTZDO2dCQUN4RCxVQUFVLEVBQUUsdUNBQXVDO2FBQ3RELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUMsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxrQkFBVSxDQUFDO2FBQ3BCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLDRCQUE0QjtZQUMvQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQzthQUNqQyxZQUFZLEVBQUUsQ0FBQztRQUVwQixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBeENELGlDQXdDQyJ9