"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('Starting bot...');
require("./overrides");
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("./utils");
(0, dotenv_1.config)();
const client = new pixoll_commando_1.CommandoClient({
    prefix: '!!',
    testAppGuild: '790051159099703316',
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
            'Speak',
            'Stream',
            'UseEmbeddedActivities',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFL0IsdUJBQXFCO0FBQ3JCLDJDQUEwRztBQUMxRyxtQ0FBZ0Q7QUFDaEQsZ0RBQXdCO0FBQ3hCLHFEQUF1RDtBQUN2RCxtQ0FBdUM7QUFDdkMsSUFBQSxlQUFZLEdBQUUsQ0FBQztBQUVmLE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQWMsQ0FBQztJQUM5QixNQUFNLEVBQUUsSUFBSTtJQUNaLFlBQVksRUFBRSxvQkFBb0I7SUFDbEMsWUFBWSxFQUFFLCtCQUErQjtJQUM3QyxhQUFhLEVBQUU7UUFDWCxNQUFNLEVBQUUsQ0FBQyx5QkFBWSxDQUFDLG9CQUFvQixFQUFFLHlCQUFZLENBQUMsR0FBRyxDQUFDO1FBQzdELFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFJLENBQUMsSUFBSSxDQUFDLGdDQUFtQixFQUFFO1lBQ3BELFNBQVM7WUFDVCxnQkFBZ0I7WUFDaEIsYUFBYTtZQUNiLGlCQUFpQjtZQUNqQixnQkFBZ0I7WUFDaEIsaUJBQWlCO1lBQ2pCLE9BQU87WUFDUCxRQUFRO1lBQ1IsdUJBQXVCO1lBQ3ZCLHFCQUFxQjtZQUNyQixRQUFRO1lBQ1IsbUJBQW1CO1NBQ3RCLENBQUMsQ0FBQztLQUNOO0lBQ0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBQSxvQkFBWSxFQUFDLDhCQUFpQixDQUFDLEVBQUU7UUFDNUQsNkJBQTZCO1FBQzdCLHlCQUF5QjtRQUN6QixlQUFlO0tBQ2xCLENBQUMsQ0FBQztJQUNILFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLHNCQUFJLENBQUMsSUFBSSxDQUFDLElBQUEsb0JBQVksRUFBQyxxQkFBUSxDQUFDLEVBQUU7UUFDdEQs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