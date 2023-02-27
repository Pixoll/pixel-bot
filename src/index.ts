console.log('Starting bot...');

import { ActivityType, GatewayIntentBits, OAuth2Scopes, Partials, PermissionFlagsBits } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { CommandoClient } from 'pixoll-commando';
import { enumToObject, omit } from './utils/functions';
dotenvConfig();

const client = new CommandoClient({
    prefix: '!!',
    testGuild: '790051159099703316',
    serverInvite: 'https://discord.gg/Pc9pAHf3GU',
    inviteOptions: {
        scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
        permissions: Object.keys(omit(PermissionFlagsBits, [
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
    intents: Object.keys(omit(enumToObject(GatewayIntentBits), [
        'AutoModerationConfiguration',
        'AutoModerationExecution',
        'GuildWebhooks',
    ])),
    partials: Object.values(omit(enumToObject(Partials), [
        'GuildScheduledEvent',
    ])),
    failIfNotExists: false,
    modulesDir: path.join(__dirname, '/modules'),
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
    if (excludeDebugEvents.test(msg)) return;
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
