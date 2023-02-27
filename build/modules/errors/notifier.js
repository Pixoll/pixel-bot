"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
const common_tags_1 = require("common-tags");
const fileTree = __dirname.split(/[\\/]+/g);
const root = fileTree[fileTree.length - 2];
const errorLogsChannelId = '906740370304540702';
const stackFilter = /node:events|node_modules(\/|\\+)(?!pixoll-commando)|\(internal|\(<anonymous>\)/;
/** A manager for all errors of the process and client */
function default_1(client) {
    client.on('commandError', async (command, error, instances) => {
        const owner = client.owners?.[0];
        const { serverInvite } = client.options;
        const id = (0, functions_1.docId)();
        const reply = new discord_js_1.EmbedBuilder()
            .setColor('Red')
            .setDescription((0, common_tags_1.stripIndent) `
				${(0, functions_1.customEmoji)('cross')} **An unexpected error happened**
				Please contact ${owner?.toString()} (${owner?.tag}) by joining the [support server](${serverInvite}).
			`)
            .addFields({
            name: 'Please send this information as well',
            value: (0, common_tags_1.stripIndent) `
                **Type:** ${error.name}
                **Error ID:** ${id}
                `,
        });
        await (0, functions_1.replyAll)(instances, reply);
        await errorHandler(client, error, 'Command error', instances, command, id);
    })
        .on('error', error => errorHandler(client, error, 'Client error'))
        .on('warn', warn => errorHandler(client, warn, 'Client warn'))
        .on('invalidated', () => {
        client.emit('debug', 'The client\'s session has become invalidated, restarting the bot...');
        process.exit(1);
    });
    process.on('unhandledRejection', error => errorHandler(client, error, 'Unhandled rejection'))
        .on('uncaughtException', error => errorHandler(client, error, 'Uncaught exception'))
        .on('uncaughtExceptionMonitor', error => errorHandler(client, error, 'Uncaught exception monitor'))
        .on('warning', error => errorHandler(client, error, 'Process warning'));
}
exports.default = default_1;
/**
 * sends the error message to the bot owner
 * @param error the error
 * @param type the type of error
 * @param instances the command instances
 * @param command the command
 * @param id the error ID to use
 */
async function errorHandler(client, error, type, instances, command, id) {
    const errorsChannel = await client.channels.fetch(errorLogsChannelId);
    if (!(error instanceof Error)) {
        console.warn(error);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Red')
            .setTitle(type)
            .setDescription(error);
        await errorsChannel.send({ embeds: [embed] });
        return;
    }
    if (command?.name === 'eval')
        return;
    console.error(error);
    const length = error.name.length + error.message.length + 3;
    const stack = error.stack?.substring(length, error.stack?.length).replace(/ +/g, ' ').split('\n');
    const files = stack
        ?.filter(str => {
        const match = stackFilter.test(str);
        if (match)
            return false;
        return str.includes(root);
    })
        .map((str) => '> ' + str
        .replace('at ', '')
        .replace(__dirname, root)
        .replace(/([\\]+)/g, '/')
        .trim())
        .join('\n');
    const instance = instances && pixoll_commando_1.Util.getInstanceFrom(instances);
    const { guild = null, channel = null, author = null } = instance ?? {};
    const url = instance instanceof pixoll_commando_1.CommandoMessage ? instance.url : null;
    const where = instance ? (guild
        ? (0, common_tags_1.stripIndent) `
        At guild **${guild.name}** (${guild.id}), channel ${channel?.toString()}.
        ${url ? `Please go to [this message](${url}) for more information.` : ''}
        `
        : `In DMs with ${author?.toString()} (${author?.tag}).`) : '';
    const whatCommand = command ? ` at '${command.name}' command` : '';
    id ??= (0, functions_1.docId)();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('Red')
        .setTitle(`${type}: \`${id}\``)
        .setDescription((0, common_tags_1.stripIndent) `
            ${(0, functions_1.customEmoji)('cross')} **An unexpected error happened**
            ${where}
        `);
    if (command && instance) {
        embed.addFields({
            name: 'Command input',
            value: (0, functions_1.code)((0, discord_js_1.escapeMarkdown)(instance.toString()).substring(0, 1016), 'js'),
        });
    }
    const stackMessage = error.name + whatCommand + ': ' + error.message.split('Require stack:').shift();
    embed.addFields({
        name: stackMessage,
        value: (0, functions_1.code)((0, functions_1.sliceDots)(files || 'No files.', 1016)),
    });
    await errorsChannel.send({
        content: client.owners?.[0].toString(),
        embeds: [embed],
    });
    if (!files)
        return;
    await client.database.errors.add({
        _id: id,
        type: type,
        name: error.name,
        message: error.message,
        command: command?.name,
        files: (0, functions_1.code)(files),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9lcnJvcnMvbm90aWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBbUc7QUFDbkcsMkNBQXVFO0FBQ3ZFLHFEQUFzRjtBQUN0Riw2Q0FBMEM7QUFFMUMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0FBQ2hELE1BQU0sV0FBVyxHQUFHLGdGQUFnRixDQUFDO0FBRXJHLHlEQUF5RDtBQUN6RCxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUU7UUFDMUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUEsaUJBQUssR0FBRSxDQUFDO1FBRW5CLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ2YsY0FBYyxDQUFDLElBQUEseUJBQVcsRUFBQTtNQUNqQyxJQUFBLHVCQUFXLEVBQUMsT0FBTyxDQUFDO3FCQUNMLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxLQUFLLEVBQUUsR0FBRyxxQ0FBcUMsWUFBWTtJQUNsRyxDQUFDO2FBQ1EsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLHNDQUFzQztZQUM1QyxLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFB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