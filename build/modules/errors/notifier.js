"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const fileTree = __dirname.split(/[\\/]+/g);
const root = fileTree[fileTree.length - 2];
const errorLogsChannelId = '906740370304540702';
const stackFilter = /node:events|node_modules(\/|\\+)(?!pixoll-commando)|\(internal|\(<anonymous>\)/;
/** A manager for all errors of the process and client */
function default_1(client) {
    client.on('commandError', async (command, error, instances) => {
        const owner = client.owners?.[0];
        const { serverInvite } = client.options;
        const id = (0, utils_1.generateDocId)();
        const reply = new discord_js_1.EmbedBuilder()
            .setColor('Red')
            .setDescription((0, common_tags_1.stripIndent) `
				${(0, utils_1.customEmoji)('cross')} **An unexpected error happened**
                ${(0, common_tags_1.oneLine) `
                Please contact ${owner?.toString()} (${owner?.tag})
                by joining the ${(0, utils_1.hyperlink)('support server', serverInvite)}.
                `}
			`)
            .addFields({
            name: 'Please send this information as well',
            value: (0, common_tags_1.stripIndent) `
                **Type:** ${error.name}
                **Error ID:** ${id}
                `,
        });
        await (0, utils_1.replyAll)(instances, reply);
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
        ${url ? `Please go to ${(0, utils_1.hyperlink)('this message', url)} for more information.` : ''}
        `
        : `In DMs with ${author?.toString()} (${author?.tag}).`) : '';
    const whatCommand = command ? ` at '${command.name}' command` : '';
    id ??= (0, utils_1.generateDocId)();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('Red')
        .setTitle(`${type}: \`${id}\``)
        .setDescription((0, common_tags_1.stripIndent) `
            ${(0, utils_1.customEmoji)('cross')} **An unexpected error happened**
            ${where}
        `);
    if (command && context) {
        embed.addFields({
            name: 'Command input',
            value: (0, utils_1.code)((0, discord_js_1.escapeMarkdown)(context.toString()).substring(0, 1016), 'js'),
        });
    }
    const stackMessage = error.name + whatCommand + ': ' + error.message.split('Require stack:').shift();
    embed.addFields({
        name: stackMessage,
        value: (0, utils_1.code)((0, utils_1.sliceDots)(files || 'No files.', 1016)),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9lcnJvcnMvbm90aWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXVFO0FBRXZFLHVDQUErRjtBQUUvRixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLENBQUM7QUFDaEQsTUFBTSxXQUFXLEdBQUcsZ0ZBQWdGLENBQUM7QUFFckcseURBQXlEO0FBQ3pELG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUMxRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBQSxxQkFBYSxHQUFFLENBQUM7UUFFM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxLQUFLLENBQUM7YUFDZixjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBO01BQ2pDLElBQUEsbUJBQVcsRUFBQyxPQUFPLENBQUM7a0JBQ1IsSUFBQSxxQkFBTyxFQUFBO2lDQUNRLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxLQUFLLEVBQUUsR0FBRztpQ0FDaEMsSUFBQSxpQkFBUyxFQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQztpQkFDekQ7SUFDYixDQUFDO2FBQ1EsU0FBUyxDQUFDO1lBQ1As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