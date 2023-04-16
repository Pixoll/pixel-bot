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
const isDevEnv = process.env.DEV_ENV === 'true';
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
    'Registered',
    'WS =>',
    'Loaded module',
    // 'Garbage collection',
    // 'executing a request',
    'Created new',
].join('|'));
client.on('debug', message => {
    if (excludeDebugEvents.test(message))
        return;
    (0, utils_1.log)([{
            message: '[DEBUG]',
            styles: ['Gold'],
        }, message], isDevEnv);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFL0IsMkNBQTBHO0FBQzFHLG1DQUFnRDtBQUNoRCxnREFBd0I7QUFDeEIscURBQXVEO0FBQ3ZELG1DQUE0QztBQUM1QyxJQUFBLGVBQVksR0FBRSxDQUFDO0FBRWYsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDO0FBRWhELE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQWMsQ0FBQztJQUM5QixNQUFNLEVBQUUsSUFBSTtJQUNaLFlBQVksRUFBRSxvQkFBb0I7SUFDbEMsWUFBWSxFQUFFLCtCQUErQjtJQUM3QyxhQUFhLEVBQUU7UUFDWCxNQUFNLEVBQUUsQ0FBQyx5QkFBWSxDQUFDLG9CQUFvQixFQUFFLHlCQUFZLENBQUMsR0FBRyxDQUFDO1FBQzdELFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFJLENBQUMsSUFBSSxDQUFDLGdDQUFtQixFQUFFO1lBQ3BELFNBQVM7WUFDVCxnQkFBZ0I7WUFDaEIsYUFBYTtZQUNiLGlCQUFpQjtZQUNqQixnQkFBZ0I7WUFDaEIsaUJBQWlCO1lBQ2pCLE9BQU87WUFDUCxRQUFRO1lBQ1IsdUJBQXVCO1lBQ3ZCLHFCQUFxQjtZQUNyQixRQUFRO1lBQ1IsbUJBQW1CO1NBQ3RCLENBQUMsQ0FBQztLQUNOO0lBQ0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBQSxvQkFBWSxFQUFDLDhCQUFpQixDQUFDLEVBQUU7UUFDNUQsNkJBQTZCO1FBQzdCLHlCQUF5QjtRQUN6QixlQUFlO0tBQ2xCLENBQUMsQ0FBQztJQUNILFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLHNCQUFJLENBQUMs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