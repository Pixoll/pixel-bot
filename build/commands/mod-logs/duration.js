"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const lodash_1 = require("lodash");
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
            name: `[${(0, lodash_1.capitalize)(doc.type)}] ${doc._id} (${doc.userTag})`,
            value: doc._id,
        }))
            .filter(doc => doc.name.toLowerCase().includes(query))
            .slice(0, 25) ?? [];
        await interaction.respond(choices);
    }
}
exports.default = DurationCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvZHVyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBK0I7QUFDL0IsNkNBQW1EO0FBRW5ELG1DQUFvQztBQUNwQyxxREFNeUI7QUFDekIsdUNBQThFO0FBRTlFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsVUFBVTtRQUNmLEtBQUssRUFBRSxZQUFZO1FBQ25CLE1BQU0sRUFBRSxnRUFBZ0U7UUFDeEUsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsRUFBRTtRQUNQLFlBQVksRUFBRSxJQUFJO0tBQ3JCLEVBQUU7UUFDQyxHQUFHLEVBQUUsVUFBVTtRQUNmLE1BQU0sRUFBRSwrQ0FBK0M7UUFDdkQsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztLQUM3QixDQUFVLENBQUM7QUFLWixNQUFxQixlQUFnQixTQUFRLHlCQUFzQjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7a0JBQzFCLElBQUEscUJBQU8sRUFBQTs7O2lCQUdSOzthQUVKO1lBQ0QsTUFBTSxFQUFFLHNDQUFzQztZQUM5QyxRQUFRLEVBQUU7Z0JBQ04sa0NBQWtDO2dCQUNsQywrQkFBK0I7YUFDbEM7WUFDRCxlQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDbEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEs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