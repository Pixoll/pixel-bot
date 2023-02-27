"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Clean-up function for the database.
 * @param client The client instance.
 * @param forceCleanup Whether to force the clean-up or not.
 */
async function default_1(client, forceCleanup = false) {
    client.on('guildDelete', async (guild) => {
        client.emit('debug', 'Running event "client/clean-up".');
        const { active, afk, disabled, mcIps, moderations, modules, polls, prefixes, reactionRoles, rules, setup, stickyRoles, welcome, } = guild.database;
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
        const { ActiveModel, AfkModel, McIpsModel, ModulesModel, ModerationsModel, PollsModel, ReactionRolesModel, RulesModel, StickyRolesModel, } = client.databaseSchemas;
        const guildIds = client.guilds.cache.map(g => g.id);
        const removedGuilds = [];
        const getRemovedGuilds = ({ guild }) => {
            if (guildIds.includes(guild))
                return false;
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
            ...Active.filter(getRemovedGuilds).map(doc => ActiveModel.deleteOne(doc)),
            ...Afk.filter(getRemovedGuilds).map(doc => AfkModel.deleteOne(doc)),
            ...McIp.filter(getRemovedGuilds).map(doc => McIpsModel.deleteOne(doc)),
            ...Modules.filter(getRemovedGuilds).map(doc => ModulesModel.deleteOne(doc)),
            ...Moderations.filter(getRemovedGuilds).map(doc => ModerationsModel.deleteOne(doc)),
            ...Polls.filter(getRemovedGuilds).map(doc => PollsModel.deleteOne(doc)),
            ...ReactionRoles.filter(getRemovedGuilds).map(doc => ReactionRolesModel.deleteOne(doc)),
            ...Rules.filter(getRemovedGuilds).map(doc => RulesModel.deleteOne(doc)),
            ...StickyRoles.filter(getRemovedGuilds).map(doc => StickyRolesModel.deleteOne(doc)),
        ]);
        for (const guildId of removedGuilds) {
            // Delete from client cache
            client.databases.delete(guildId);
        }
        client.emit('debug', 'Cleaned up database');
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW4tdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9jbGllbnQvY2xlYW4tdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7OztHQUlHO0FBQ1ksS0FBSyxvQkFBVyxNQUE0QixFQUFFLFlBQVksR0FBRyxLQUFLO0lBQzdFLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtRQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBRXpELE1BQU0sRUFDRixNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFDN0csT0FBTyxHQUNWLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUVuQixxQ0FBcUM7UUFDckMsTUFBTSxVQUFVLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDNUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDOUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDMUMsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxRCxNQUFNLGVBQWUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV0RCwyQkFBMkI7UUFDM0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxFQUFF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