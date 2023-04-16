import { Document, Model } from 'mongoose';
import { BaseSchema, CommandoClient, DatabaseManager, DocumentFrom, JSONIfySchema, Util } from 'pixoll-commando';

type BaseSchemaWithGuild = BaseSchema & {
    guild?: string;
};

/**
 * Clean-up function for the database.
 * @param client The client instance.
 * @param forceCleanup Whether to force the clean-up or not.
 */
export default async function (client: CommandoClient<true>, forceCleanup = false): Promise<void> {
    client.on('guildDelete', async guild => {
        const { database, id } = guild;
        client.emit('debug', `Running event "client/clean-up" for "${id}".`);

        const databases = Object.values(database)
            .filter((db): db is DatabaseManager<BaseSchema> => db instanceof DatabaseManager);

        await Promise.all(databases.map(async db => {
            const docs = await db.fetchMany();
            await Promise.all(docs.map(db.delete.bind(db)));
        }));

        client.databases.delete(id);
    });

    if (!forceCleanup && new Date().getUTCDate() !== 1) return;

    // Monthly/forced clean-up
    client.emit('debug', 'Cleaning up database...');

    const databases = Util.omit(client.databaseSchemas, [
        'ErrorsModel',
        'FaqModel',
        'RemindersModel',
        'TodoModel',
    ]);

    const guildIds = client.guilds.cache.map(g => g.id);
    const getDocsFromRemovedGuilds = ({ guild }: JSONIfySchema<BaseSchemaWithGuild>): boolean => {
        if (!guild) return false;
        if (guildIds.includes(guild)) return false;
        client.databases.delete(guild);
        return true;
    };

    await Promise.all((Object.values(databases) as Array<Model<DocumentFrom<BaseSchemaWithGuild>>>).map(async model => {
        const allDocs = await model.find<Document<BaseSchemaWithGuild>>();
        const docsToRemove = allDocs
            .map(doc => Util.jsonifyDocument(doc))
            .filter(getDocsFromRemovedGuilds);
        await Promise.all(docsToRemove.map(doc => model.deleteOne(getDocId(doc))));
    }));

    client.emit('debug', 'Cleaned up database');
}

function getDocId<T extends { _id: unknown }>(doc: Document<T> | T): { _id?: string } {
    return { _id: doc._id?.toString() };
}
