"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'modLogId',
        label: 'mod-log ID',
        prompt: 'What is the ID of the mod log you want to change the duration?',
        type: 'string',
        max: 16,
        autocomplete: true,
    }, {
        key: 'duration',
        prompt: 'What will be the new duration of the mod log?',
        type: ['date', 'duration'],
    }];
class DurationCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'duration',
            group: 'mod-logs',
            description: 'Change the duration of a punishment.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                ${(0, common_tags_1.oneLine) `
                \`mod-log ID ID\` has to be a valid mod log ID.
                To see all the mod logs in this server use the \`mod-logs\` command.
                `}
                \`new duration\` uses the bot's time formatting, for more information use the \`help\` command.
            `,
            format: 'duration [mod-log ID] [new duration]',
            examples: [
                'duration 123456abcdef 12/30/2022',
                'duration 186b2a4d2590270f 30d',
            ],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { modLogId, duration }) {
        const parsedDuration = await (0, utils_1.parseArgDate)(context, this, 1, duration);
        if (!parsedDuration)
            return;
        duration = parsedDuration;
        const { guild } = context;
        const { moderations, active } = guild.database;
        const modLog = await moderations.fetch(modLogId);
        if (!modLog) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I could not find the mod-log you were looking for.',
            }));
            return;
        }
        const activeLog = await active.fetch(modLogId);
        if (!activeLog) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That punishment has expired.',
            }));
            return;
        }
        const now = Date.now();
        if (typeof duration === 'number')
            duration = duration + now;
        if (duration instanceof Date)
            duration = duration.getTime();
        const longTime = (0, better_ms_1.ms)(duration - now, { long: true });
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'update mod log duration',
            target: modLogId,
            duration: longTime,
        });
        if (!confirmed)
            return;
        await moderations.update(modLog, { duration: longTime });
        await active.update(activeLog, {
            duration: duration - now + Date.now(),
        });
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Updated duration for mod log \`${modLogId}\``,
            fieldValue: `**New duration:** ${longTime}`,
        }));
    }
    async runAutocomplete(interaction) {
        const { guild, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const documents = await guild?.database.active.fetchMany();
        const choices = documents?.toJSON()
            ?.map(doc => ({
            name: `[${pixoll_commando_1.Util.capitalize(doc.type)}] ${doc._id} (${doc.userTag})`,
            value: doc._id,
        }))
            .filter(doc => doc.name.toLowerCase().includes(query))
            .slice(0, 25) ?? [];
        await interaction.respond(choices);
    }
}
exports.default = DurationCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvZHVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBK0I7QUFDL0IsNkNBQW1EO0FBRW5ELHFEQU95QjtBQUN6Qix1Q0FBOEU7QUFFOUUsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxVQUFVO1FBQ2YsS0FBSyxFQUFFLFlBQVk7UUFDbkIsTUFBTSxFQUFFLGdFQUFnRTtRQUN4RSxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxFQUFFO1FBQ1AsWUFBWSxFQUFFLElBQUk7S0FDckIsRUFBRTtRQUNDLEdBQUcsRUFBRSxVQUFVO1FBQ2YsTUFBTSxFQUFFLCtDQUErQztRQUN2RCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDO0tBQzdCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGVBQWdCLFNBQVEseUJBQXNCO0lBQy9ELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTtrQkFDMUIsSUFBQSxxQkFBTyxFQUFBOzs7aUJBR1I7O2FBRUo7WUFDRCxNQUFNLEVBQUUsc0NBQXNDO1lBQzlDLFFBQVEsRUFBRTtnQkFDTixrQ0FBa0M7Z0JBQ2xDLCtCQUErQjthQUNsQztZQUNELGVBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUNsQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFjO1FBQzlFLE1B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