"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
/**
 * Clean-up function for the database.
 * @param client The client instance.
 * @param forceCleanup Whether to force the clean-up or not.
 */
async function default_1(client, forceCleanup = false) {
    client.on('guildDelete', async (guild) => {
        const { database, id } = guild;
        client.emit('debug', `Running event "client/clean-up" for "${id}".`);
        const databases = Object.values(database)
            .filter((db) => db instanceof pixoll_commando_1.DatabaseManager);
        await Promise.all(databases.map(async (db) => {
            const docs = await db.fetchMany();
            await Promise.all(docs.map(db.delete.bind(db)));
        }));
        client.databases.delete(id);
    });
    if (!forceCleanup && new Date().getUTCDate() !== 1)
        return;
    // Monthly/forced clean-up
    client.emit('debug', 'Cleaning up database...');
    const databases = pixoll_commando_1.Util.omit(client.databaseSchemas, [
        'ErrorsModel',
        'FaqModel',
        'RemindersModel',
        'TodoModel',
    ]);
    const guildIds = client.guilds.cache.map(g => g.id);
    const getDocsFromRemovedGuilds = ({ guild }) => {
        if (!guild)
            return false;
        if (guildIds.includes(guild))
            return false;
        client.databases.delete(guild);
        return true;
    };
    await Promise.all(Object.values(databases).map(async (model) => {
        const allDocs = await model.find();
        const docsToRemove = allDocs
            .map(doc => pixoll_commando_1.Util.jsonifyDocument(doc))
            .filter(getDocsFromRemovedGuilds);
        await Promise.all(docsToRemove.map(doc => model.deleteOne(getDocId(doc))));
    }));
    client.emit('debug', 'Cleaned up database');
}
exports.default = default_1;
function getDocId(doc) {
    return { _id: doc._id?.toString() };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW4tdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9jbGllbnQvY2xlYW4tdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFBaUg7QUFNakg7Ozs7R0FJRztBQUNZLEtBQUssb0JBQVcsTUFBNEIsRUFBRSxZQUFZLEdBQUcsS0FBSztJQUM3RSxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7UUFDbkMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsd0NBQXdDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFckUsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7YUFDcEMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFxQyxFQUFFLENBQUMsRUFBRSxZQUFZLGlDQUFlLENBQUMsQ0FBQztRQUV0RixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsRUFBRSxFQUFDLEVBQUU7WUFDdkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbEMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFSixNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO1FBQUUsT0FBTztJQUUzRCwwQkFBMEI7SUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUseUJBQXlCLENBQUMsQ0FBQztJQUVoRCxNQUFNLFNBQVMsR0FBRyxzQkFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO1FBQ2hELGFBQWE7UUFDYixVQUFVO1FBQ1YsZ0JBQWdCO1FBQ2hCLFdBQVc7S0FDZCxDQUFDLENBQUM7SUFFSCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEQsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFzQyxFQUFXLEVBQUU7UUFDeEYsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN6QixJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDM0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFxRCxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7UUFDOUcsTUFBTSxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFpQyxDQUFDO1FBQ2xFLE1BQU0sWUFBWSxHQUFHLE9BQU87YUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsc0JBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDckMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRUosTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBN0NELDRCQTZDQztBQUVELFNBQVMsUUFBUSxDQUE2QixHQUFvQjtJQUM5RCxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztBQUN4QyxDQUFDIn0=