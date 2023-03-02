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
        const database = client.databaseSchemas[collection];
        const rawData = await database.find({});
        const dataArray = rawData.map((doc) => {
            const rawDocument = doc;
            const parsedDocument = '_doc' in rawDocument ? rawDocument._doc : rawDocument;
            return pixoll_commando_1.Util.omit(parsedDocument, ['_id', 'updatedAt', '__v']);
        });
        const dbName = collection.replace('Model', ' ');
        if (dataArray.length === 0) {
            await context.replyEmbed((0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: `The ${dbName} collection is empty.`,
            }));
            return;
        }
        await (0, functions_1.generateEmbed)(context, dataArray, {
            authorName: `Database: ${dbName}`,
            authorIconURL: client.user.displayAvatarURL({ forceStatic: false }),
            title: 'Document',
            keysExclude: ['updatedAt'],
        });
    }
}
exports.default = DatabaseCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvb3duZXIvZGF0YWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFPeUI7QUFFekIscURBQWtFO0FBR2xFLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBeUIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QyxHQUFHLEVBQUUsWUFBWTtRQUNqQixNQUFNLEVBQUUsd0NBQXdDO1FBQ2hELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE9BQU87S0FDakIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsZUFBZ0IsU0FBUSx5QkFBdUI7SUFDaEUsWUFBbUIsTUFBc0I7UUFDckMsTUFBTSxlQUFlLEdBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTlFLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDZixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxzQkFBc0I7WUFDbkMsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDO1NBQzlCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQThCLEVBQUUsRUFBRSxVQUFVLEVBQWM7UUFDdkUsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQUUsT0FBTztRQUNwQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTNCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFpQyxDQUFDO1FBQ3BGLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFFbEMsTUFBTSxXQUFXLEdBQUcsR0FBVSxDQUFDO1lBQy9CLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUM5RSxPQUFPLHNCQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWhELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDeEIsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsc0JBQVUsRUFBQztnQkFDaEMsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLE9BQU8sTUFBTSx1QkFBdUI7YUFDcEQsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUEseUJBQWEsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFO1lBQ3BDLFVBQVUsRUFBRSxhQUFhLE1BQU0sRUFBRTtZQUNqQyxhQUFhLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNuRSxLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUM7U0FDN0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBOUNELGtDQThDQyJ9