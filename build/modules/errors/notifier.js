"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
 * @param context the command instances
 * @param command the command
 * @param id the error ID to use
 */
async function errorHandler(client, error, type, context, command, id) {
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
    const { guild = null, channel = null, author = null } = context ?? {};
    const url = context?.isMessage() ? context.url : null;
    const where = context ? (guild
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
    if (command && context) {
        embed.addFields({
            name: 'Command input',
            value: (0, functions_1.code)((0, discord_js_1.escapeMarkdown)(context.toString()).substring(0, 1016), 'js'),
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
    // TODO: Do not send data to DB until production-ready
    // await client.database.errors.add({
    //     _id: id,
    //     type: type,
    //     name: error.name,
    //     message: error.message,
    //     command: command?.name,
    //     files: code(files),
    // });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9lcnJvcnMvbm90aWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBdUU7QUFDdkUscURBQXNGO0FBQ3RGLDZDQUEwQztBQUUxQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLENBQUM7QUFDaEQsTUFBTSxXQUFXLEdBQUcsZ0ZBQWdGLENBQUM7QUFFckcseURBQXlEO0FBQ3pELG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUMxRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBQSxpQkFBSyxHQUFFLENBQUM7UUFFbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxLQUFLLENBQUM7YUFDZixjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBO01BQ2pDLElBQUEsdUJBQVcsRUFBQyxPQUFPLENBQUM7cUJBQ0wsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEtBQUssRUFBRSxHQUFHLHFDQUFxQyxZQUFZO0lBQ2xHLENBQUM7YUFDUSxTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsc0NBQXNDO1lBQzVDLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7NEJBQ04sS0FBSyxD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