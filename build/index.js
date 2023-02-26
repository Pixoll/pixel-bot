"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('Starting bot...');
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("./utils/functions");
(0, dotenv_1.config)();
const client = new pixoll_commando_1.CommandoClient({
    prefix: '!!',
    owners: ['667937325002784768'],
    testGuild: '790051159099703316',
    serverInvite: 'https://discord.gg/Pc9pAHf3GU',
    inviteOptions: {
        scopes: [discord_js_1.OAuth2Scopes.ApplicationsCommands, discord_js_1.OAuth2Scopes.Bot],
        permissions: Object.keys((0, functions_1.omit)(discord_js_1.PermissionFlagsBits, [
            'Connect',
            'ManageWebhooks',
            'MoveMembers',
            'PrioritySpeaker',
            'RequestToSpeak',
            'SendTTSMessages',
            'UseExternalStickers',
            'UseVAD',
            'ViewGuildInsights',
        ])),
    },
    intents: Object.keys((0, functions_1.omit)((0, functions_1.enumToObject)(discord_js_1.GatewayIntentBits), [
        'AutoModerationConfiguration',
        'AutoModerationExecution',
        'GuildWebhooks',
    ])),
    partials: Object.values((0, functions_1.omit)((0, functions_1.enumToObject)(discord_js_1.Partials), [
        'GuildScheduledEvent',
    ])),
    failIfNotExists: false,
    modulesDir: path_1.default.join(__dirname, '/modules'),
    excludeModules: ['chat-filter', 'scam-detector'],
});
const excludeDebugEvents = new RegExp([
    'Heartbeat',
    'Registered',
    'WS',
    'Loaded feature',
    'finished for guild',
    'Garbage collection',
    'executing a request',
    'Created new',
].join('|'));
client.on('debug', (...msgs) => {
    const msg = msgs.join(' ');
    if (excludeDebugEvents.test(msg))
        return;
    console.log('debug >', msg);
});
client.emit('debug', 'Created client');
client.registry
    .registerDefaultTypes()
    .registerGroups([
    { id: 'info', name: '\u2139 Information', guarded: true },
    // { id: 'fun', name: 'Fun commands' },
    { id: 'lists', name: '📋 Listing' },
    { id: 'managing', name: '💼 Managing', guarded: true },
    // { id: 'minecraft', name: '<:minecraft:897178717925834773> Minecraft' },
    { id: 'misc', name: '🎲 Miscellaneous' },
    { id: 'mod', name: ':shield: Moderation' },
    { id: 'mod-logs', name: '🗃 Moderation logs' },
    { id: 'owner', name: '<a:owner_crown:806558872440930425> Owner only', guarded: true },
    { id: 'utility', name: '🛠 Utility', guarded: true },
]);
client.emit('debug', `Loaded ${client.registry.groups.size} groups`);
client.registry.registerCommandsIn(path_1.default.join(__dirname, '/commands'));
client.emit('debug', `Loaded ${client.registry.commands.size} commands`);
client.on('modulesReady', async (client) => {
    client.user.setActivity({
        name: `for ${client.prefix}help`,
        type: discord_js_1.ActivityType.Watching,
    });
    await client.owners?.[0].send('**Debug message:** Bot is fully online!');
    client.emit('debug', `${client.user.tag} is fully online!`);
});
client.login().then(() => client.emit('debug', 'Logged in'));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFL0IsMkNBQTBHO0FBQzFHLG1DQUFnRDtBQUNoRCxnREFBd0I7QUFDeEIscURBQWlEO0FBQ2pELGlEQUF1RDtBQUN2RCxJQUFBLGVBQVksR0FBRSxDQUFDO0FBRWYsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBYyxDQUFDO0lBQzlCLE1BQU0sRUFBRSxJQUFJO0lBQ1osTUFBTSxFQUFFLENBQUMsb0JBQW9CLENBQUM7SUFDOUIsU0FBUyxFQUFFLG9CQUFvQjtJQUMvQixZQUFZLEVBQUUsK0JBQStCO0lBQzdDLGFBQWEsRUFBRTtRQUNYLE1BQU0sRUFBRSxDQUFDLHlCQUFZLENBQUMsb0JBQW9CLEVBQUUseUJBQVksQ0FBQyxHQUFHLENBQUM7UUFDN0QsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBQSxnQkFBSSxFQUFDLGdDQUFtQixFQUFFO1lBQy9DLFNBQVM7WUFDVCxnQkFBZ0I7WUFDaEIsYUFBYTtZQUNiLGlCQUFpQjtZQUNqQixnQkFBZ0I7WUFDaEIsaUJBQWlCO1lBQ2pCLHFCQUFxQjtZQUNyQixRQUFRO1lBQ1IsbUJBQW1CO1NBQ3RCLENBQUMsQ0FBQztLQUNOO0lBQ0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBQSxnQkFBSSxFQUFDLElBQUEsd0JBQVksRUFBQyw4QkFBaUIsQ0FBQyxFQUFFO1FBQ3ZELDZCQUE2QjtRQUM3Qix5QkFBeUI7UUFDekIsZUFBZTtLQUNsQixDQUFDLENBQUM7SUFDSCxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFBLGdCQUFJLEVBQUMsSUFBQSx3QkFBWSxFQUFDLHFCQUFRLENBQUMsRUFBRTtRQUNqRCxxQkFBcUI7S0FDeEIsQ0FBQyxDQUFDO0lBQ0gs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