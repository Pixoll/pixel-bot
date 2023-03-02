"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
function getStatusString(isOn) {
    if (isOn === true)
        return `Enabled ${(0, functions_1.customEmoji)('online')}`;
    return `Disabled ${(0, functions_1.customEmoji)('dnd')}`;
}
function mapModuleData(data) {
    return Object.entries(pixoll_commando_1.Util.omit(data, [
        '__v', '_id', 'guild',
    ])).sort(([key1], [key2, value]) => typeof value === 'boolean' ? (0, functions_1.abcOrder)(key1, key2) : -1).map(([key, value]) => {
        if (typeof value === 'boolean') {
            return `**${(0, lodash_1.capitalize)((0, functions_1.addDashes)(key).replace(/-/g, ' '))}:** ${getStatusString(value)}`;
        }
        return [`**${(0, lodash_1.capitalize)((0, functions_1.addDashes)(key).replace(/-/g, ' '))}:**`, Object.entries(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            value ?? {}).map(([nestedKey, nestedValue]) => `\u2800⤷ **${(0, lodash_1.capitalize)((0, functions_1.addDashes)(nestedKey))}:** ${getStatusString(nestedValue)}`).join('\n')].join('\n');
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
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }
        const moduleStatsString = mapModuleData(data);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${guild.name}'s modules and sub-modules`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(moduleStatsString)
            .setTimestamp();
        await (0, functions_1.replyAll)(context, embed);
    }
}
exports.default = ModulesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsaXR5L21vZHVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBMEM7QUFDMUMsbUNBQW9DO0FBQ3BDLHFEQUE4RjtBQUM5RixxREFBK0Y7QUFFL0YsU0FBUyxlQUFlLENBQUMsSUFBYztJQUNuQyxJQUFJLElBQUksS0FBSyxJQUFJO1FBQUUsT0FBTyxXQUFXLElBQUEsdUJBQVcsRUFBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0lBQzdELE9BQU8sWUFBWSxJQUFBLHVCQUFXLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBMkI7SUFDOUMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNsQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU87S0FDeEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQy9CLE9BQU8sS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBQSxvQkFBUSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3pELENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUNuQixJQUFJLE9BQU8sS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUM1QixPQUFPLEtBQUssSUFBQSxtQkFBVSxFQUFDLElBQUEscUJBQVMsRUFBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7U0FDNUY7UUFDRCxPQUFPLENBQUMsS0FBSyxJQUFBLG1CQUFVLEVBQUMsSUFBQSxxQkFBUyxFQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1lBQzNFLHlFQUF5RTtZQUN6RSxLQUFLLElBQUksRUFBK0IsQ0FDM0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLENBQy9CLGFBQWEsSUFBQSxtQkFBVSxFQUFDLElBQUEscUJBQVMsRUFBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUNyRixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQUVELE1BQXFCLGNBQWUsU0FBUSx5QkFBYTtJQUNyRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsU0FBUztZQUNoQixXQUFXLEVBQUUsNERBQTREO1lBQ3pFLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsU0FBUyxFQUFFLDZDQUE2QztnQkFDeEQsVUFBVSxFQUFFLHVDQUF1QzthQUN0RCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0saUJBQWlCLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTlDLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLDRCQUE0QjtZQUMvQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQzthQUNqQyxZQUFZLEVBQUUsQ0FBQztRQUVwQixNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBeENELGlDQXdDQyJ9