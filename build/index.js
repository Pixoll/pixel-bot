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
const utils_1 = require("./utils");
(0, dotenv_1.config)();
const client = new pixoll_commando_1.CommandoClient({
    prefix: '!!',
    testGuild: '790051159099703316',
    serverInvite: 'https://discord.gg/Pc9pAHf3GU',
    inviteOptions: {
        scopes: [discord_js_1.OAuth2Scopes.ApplicationsCommands, discord_js_1.OAuth2Scopes.Bot],
        permissions: Object.keys(pixoll_commando_1.Util.omit(discord_js_1.PermissionFlagsBits, [
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
    intents: Object.keys(pixoll_commando_1.Util.omit((0, utils_1.enumToObject)(discord_js_1.GatewayIntentBits), [
        'AutoModerationConfiguration',
        'AutoModerationExecution',
        'GuildWebhooks',
    ])),
    partials: Object.values(pixoll_commando_1.Util.omit((0, utils_1.enumToObject)(discord_js_1.Partials), [
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
    'Loaded module',
    'finished for guild',
    'Garbage collection',
    'executing a request',
    'Created new',
].join('|'));
client.on('debug', message => {
    if (excludeDebugEvents.test(message))
        return;
    console.log('debug >', message);
});
client.emit('debug', 'Created client');
client.registry
    .registerDefaultTypes()
    .registerGroups([
    { id: 'info', name: 'ℹ️ Information', guarded: true },
    // { id: 'fun', name: 'Fun commands' },
    { id: 'lists', name: '📋 Listing' },
    { id: 'managing', name: '💼 Managing', guarded: true },
    // { id: 'minecraft', name: '<:minecraft:897178717925834773> Minecraft' },
    { id: 'misc', name: '🎲 Miscellaneous' },
    { id: 'mod', name: '🛡️ Moderation' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFL0IsMkNBQTBHO0FBQzFHLG1DQUFnRDtBQUNoRCxnREFBd0I7QUFDeEIscURBQXVEO0FBQ3ZELG1DQUF1QztBQUN2QyxJQUFBLGVBQVksR0FBRSxDQUFDO0FBRWYsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBYyxDQUFDO0lBQzlCLE1BQU0sRUFBRSxJQUFJO0lBQ1osU0FBUyxFQUFFLG9CQUFvQjtJQUMvQixZQUFZLEVBQUUsK0JBQStCO0lBQzdDLGFBQWEsRUFBRTtRQUNYLE1BQU0sRUFBRSxDQUFDLHlCQUFZLENBQUMsb0JBQW9CLEVBQUUseUJBQVksQ0FBQyxHQUFHLENBQUM7UUFDN0QsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQW1CLEVBQUU7WUFDcEQsU0FBUztZQUNULGdCQUFnQjtZQUNoQixhQUFhO1lBQ2IsaUJBQWlCO1lBQ2pCLGdCQUFnQjtZQUNoQixpQkFBaUI7WUFDakIscUJBQXFCO1lBQ3JCLFFBQVE7WUFDUixtQkFBbUI7U0FDdEIsQ0FBQyxDQUFDO0tBQ047SUFDRCxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFBLG9CQUFZLEVBQUMsOEJBQWlCLENBQUMsRUFBRTtRQUM1RCw2QkFBNkI7UUFDN0IseUJBQXlCO1FBQ3pCLGVBQWU7S0FDbEIsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBQSxvQkFBWSxFQUFDLHFCQUFRLENBQUMsRUFBRTtRQUN0RCxxQkFBcUI7S0FDeEIsQ0FBQyxDQUFDO0lBQ0gsZUFBZSxFQUFFLEtBQUs7SUFD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