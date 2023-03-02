import { CommandoClient } from 'pixoll-commando';

/**
 * Clean-up function for the database.
 * @param client The client instance.
 * @param forceCleanup Whether to force the clean-up or not.
 */
export default async function (client: CommandoClient<true>, forceCleanup = false): Promise<void> {
    client.on('guildDelete', async guild => {
        client.emit('debug', 'Running event "client/clean-up".');

        const {
            active, afk, disabled, mcIps, moderations, modules, polls, prefixes, reactionRoles, rules, setup, stickyRoles,
            welcome,
        } = guild.database;

        // Fetches multiple documents at once
        const activeDocs = await active.fetchMany();
        const afkDocs = await afk.fetchMany();
        const modDocs = await moderations.fetchMany();
        const pollsDocs = await polls.fetchMany();
        const reactionRolesDocs = await reactionRoles.fetchMany();
        const stickyRolesDocs = await stickyRoles.fetchMany();

        // Fetches single documents
        const disabledDoc = await disabled.fetch();
        const mcIpsDoc = await mcIps.fetch();
        const modulesDoc = await modules.fetch();
        const prefixesDoc = await prefixes.fetch();
        const rulesDoc = await rules.fetch();
        const setupDoc = await setup.fetch();
        const welcomeDoc = await welcome.fetch();

        await Promise.all([
            // Deletes multiple documents
            ...activeDocs.map(doc => active.delete(doc)),
            ...afkDocs.map(doc => afk.delete(doc)),
            ...modDocs.map(doc => moderations.delete(doc)),
            ...pollsDocs.map(doc => polls.delete(doc)),
            ...reactionRolesDocs.map(doc => reactionRoles.delete(doc)),
            ...stickyRolesDocs.map(doc => stickyRoles.delete(doc)),

            // Deletes single documents
            ...[disabledDoc && disabled.delete(disabledDoc)],
            ...[mcIpsDoc && mcIps.delete(mcIpsDoc)],
            ...[modulesDoc && modules.delete(modulesDoc)],
            ...[prefixesDoc && prefixes.delete(prefixesDoc)],
            ...[rulesDoc && rules.delete(rulesDoc)],
            ...[setupDoc && setup.delete(setupDoc)],
            ...[welcomeDoc && welcome.delete(welcomeDoc)],
        ]);
    });

    // Monthly clean-up
    if (forceCleanup || new Date().getUTCDate() === 1) {
        client.emit('debug', 'Cleaning up database...');

        const {
            ActiveModel, AfkModel, McIpsModel, ModulesModel, ModerationsModel, PollsModel, ReactionRolesModel,
            RulesModel, StickyRolesModel,
        } = client.databaseSchemas;
        const guildIds = client.guilds.cache.map(g => g.id);
        const removedGuilds: string[] = [];
        const getRemovedGuilds = ({ guild }: { guild: string }): boolean => {
            if (guildIds.includes(guild)) return false;
            if (removedGuilds.some(guildId => guildId !== guild)) {
                removedGuilds.push(guild);
            }
            return true;
        };

        const Active = await ActiveModel.find({});
        const Afk = await AfkModel.find({});
        const McIp = await McIpsModel.find({});
        const Modules = await ModulesModel.find({});
        const Moderations = await ModerationsModel.find({});
        const Polls = await PollsModel.find({});
        const ReactionRoles = await ReactionRolesModel.find({});
        const Rules = await RulesModel.find({});
        const StickyRoles = await StickyRolesModel.find({});

        await Promise.all([
            ...Active.filter(getRemovedGuilds).map(doc => ActiveModel.deleteOne(getDocId(doc))),
            ...Afk.filter(getRemovedGuilds).map(doc => AfkModel.deleteOne(getDocId(doc))),
            ...McIp.filter(getRemovedGuilds).map(doc => McIpsModel.deleteOne(getDocId(doc))),
            ...Modules.filter(getRemovedGuilds).map(doc => ModulesModel.deleteOne(getDocId(doc))),
            ...Moderations.filter(getRemovedGuilds).map(doc => ModerationsModel.deleteOne(getDocId(doc))),
            ...Polls.filter(getRemovedGuilds).map(doc => PollsModel.deleteOne(getDocId(doc))),
            ...ReactionRoles.filter(getRemovedGuilds).map(doc => ReactionRolesModel.deleteOne(getDocId(doc))),
            ...Rules.filter(getRemovedGuilds).map(doc => RulesModel.deleteOne(getDocId(doc))),
            ...StickyRoles.filter(getRemovedGuilds).map(doc => StickyRolesModel.deleteOne(getDocId(doc))),
        ]);

        for (const guildId of removedGuilds) {
            // Delete from client cache
            client.databases.delete(guildId);
        }

        client.emit('debug', 'Cleaned up database');
    }
}

function getDocId<Id, T extends { _id: Id }>(doc: T): { _id: Id } {
    return { _id: doc._id };
}
