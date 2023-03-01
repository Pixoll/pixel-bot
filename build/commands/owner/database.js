"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const args = (options) => [{
        key: 'collection',
        prompt: 'What collection do you want to manage?',
        type: 'string',
        oneOf: options,
    }];
class DatabaseCommand extends pixoll_commando_1.Command {
    constructor(client) {
        const databaseOptions = Object.keys(client.databaseSchemas);
        super(client, {
            name: 'database',
            aliases: ['db'],
            group: 'owner',
            description: 'Manage the database.',
            ownerOnly: true,
            dmOnly: true,
            args: args(databaseOptions),
        });
    }
    async run(context, { collection }) {
        if (context.isInteraction())
            return;
        const { client } = context;
        const rawData = await client.databaseSchemas[collection].find({});
        const dataArray = rawData.map((doc) => {
            const rawDocument = doc;
            const parsedDocument = '_doc' in rawDocument ? rawDocument._doc : rawDocument;
            return pixoll_commando_1.Util.omit(parsedDocument, ['_id', 'updatedAt', '__v']);
        });
        const DBname = collection.replace('Model', ' ');
        if (dataArray.length === 0) {
            await context.replyEmbed((0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: `The ${DBname} collection is empty.`,
            }));
            return;
        }
        await (0, functions_1.generateEmbed)(context, dataArray, {
            authorName: `Database: ${DBname}`,
            authorIconURL: client.user.displayAvatarURL({ forceStatic: false }),
            title: 'Document',
            keysExclude: ['updatedAt'],
        });
    }
}
exports.default = DatabaseCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvb3duZXIvZGF0YWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFPeUI7QUFDekIscURBQWtFO0FBR2xFLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBeUIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QyxHQUFHLEVBQUUsWUFBWTtRQUNqQixNQUFNLEVBQUUsd0NBQXdDO1FBQ2hELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE9BQU87S0FDakIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsZUFBZ0IsU0FBUSx5QkFBdUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsTUFBTSxlQUFlLEdBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTlFLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDZixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxzQkFBc0I7WUFDbkMsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDO1NBQzlCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQThCLEVBQUUsRUFBRSxVQUFVLEVBQWM7UUFDdkUsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQUUsT0FBTztRQUNwQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTNCLE1BQU0sT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBRWxDLE1BQU0sV0FBVyxHQUFHLEdBQVUsQ0FBQztZQUMvQixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFDOUUsT0FBTyxzQkFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVoRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFBLHNCQUFVLEVBQUM7Z0JBQ2hDLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSxPQUFPLE1BQU0sdUJBQXVCO2FBQ3BELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFBLHlCQUFhLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRTtZQUNwQyxVQUFVLEVBQUUsYUFBYSxNQUFNLEVBQUU7WUFDakMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDbkUsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLENBQUMsV0FBVyxDQUFDO1NBQzdCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTdDRCxrQ0E2Q0MifQ==