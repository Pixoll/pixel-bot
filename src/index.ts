console.log('Starting bot...');

import { ActivityType, GatewayIntentBits, OAuth2Scopes, Partials, PermissionFlagsBits } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { CommandoClient, Util } from 'pixoll-commando';
import { enumToObject, log } from './utils';
dotenvConfig();

const isDevEnv = process.env.DEV_ENV === 'true';

const client = new CommandoClient({
    prefix: '!!',
    testAppGuild: '790051159099703316',
    serverInvite: 'https://discord.gg/Pc9pAHf3GU',
    inviteOptions: {
        scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
        permissions: Object.keys(Util.omit(PermissionFlagsBits, [
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
    intents: Object.keys(Util.omit(enumToObject(GatewayIntentBits), [
        'AutoModerationConfiguration',
        'AutoModerationExecution',
        'GuildWebhooks',
    ])),
    partials: Object.values(Util.omit(enumToObject(Partials), [
        'GuildScheduledEvent',
    ])),
    failIfNotExists: false,
    modulesDir: path.join(__dirname, '/modules'),
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
    if (excludeDebugEvents.test(message)) return;
    log([{
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

client.registry.registerCommandsIn(path.join(__dirname, '/commands'));
client.emit('debug', `Loaded ${client.registry.commands.size} commands`);

client.on('modulesReady', async client => {
    client.user.setActivity({
        name: `for ${client.prefix}help`,
        type: ActivityType.Watching,
    });

    await client.owners?.[0].send('**Debug message:** Bot is fully online!');
    client.emit('debug', `${client.user.tag} is fully online!`);
});

client.login().then(() =>
    client.emit('debug', 'Logged in')
);
