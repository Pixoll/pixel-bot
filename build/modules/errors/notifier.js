"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const eval_1 = __importDefault(require("../../commands/owner/eval"));
const utils_1 = require("../../utils");
const errorLogsChannelId = '906740370304540702';
const excludeStack = /node:(?:events|internal)|\(<anonymous>\)/;
const includeStack = /pixoll-commando/;
const evalName = eval_1.default.name;
/** A manager for all errors of the process and client */
function default_1(client) {
    client.on('commandError', async (command, error, context) => {
        const owner = client.owners?.[0];
        const { serverInvite } = client.options;
        const id = (0, utils_1.generateDocId)();
        const embed = new discord_js_1.EmbedBuilder()
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
        await (0, utils_1.reply)(context, embed);
        await errorHandler(client, error, utils_1.errorTypeMap.command, context, command, id);
    })
        .on('error', error => errorHandler(client, error, utils_1.errorTypeMap.error))
        .on('warn', warn => errorHandler(client, warn, utils_1.errorTypeMap.warn))
        .on('invalidated', () => {
        client.emit('debug', 'The client\'s session has become invalidated, restarting the bot...');
        process.exit(1);
    });
    process.on('unhandledRejection', error => errorHandler(client, error, utils_1.errorTypeMap.rejection))
        .on('uncaughtException', error => errorHandler(client, error, utils_1.errorTypeMap.exception))
        .on('uncaughtExceptionMonitor', error => errorHandler(client, error, utils_1.errorTypeMap.exceptionMonitor))
        .on('warning', error => errorHandler(client, error, utils_1.errorTypeMap.processWarning));
}
exports.default = default_1;
/**
 * sends the error message to the bot owner
 * @param error the error
 * @param type the type of error
 * @param context the command context
 * @param command the command
 * @param errorId the error ID to use
 */
async function errorHandler(client, error, type, context, command, errorId) {
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
    if (command?.name === 'eval' || error.stack?.includes(evalName) || isDjsAbortError(error))
        return;
    console.error(error);
    const length = error.name.length + error.message.length + 3;
    const stack = error.stack?.substring(length, error.stack?.length).replace(/ +/g, ' ').split('\n');
    const files = stack
        ?.filter(string => excludeStack.test(string) ? includeStack.test(string) : true)
        .map((string) => '> ' + string
        .trim()
        .replace('at ', '')
        .replace(process.cwd(), '')
        .replace(/([\\]+)/g, '/')
        .replace('/node_modules/', '@')
        .replace('(@@', '(@'))
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
    errorId ??= (0, utils_1.generateDocId)();
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('Red')
        .setTitle(`${type}: \`${errorId}\``)
        .setDescription((0, common_tags_1.stripIndent) `
            ${(0, utils_1.customEmoji)('cross')} **An unexpected error happened**
            ${where}
        `);
    if (command && context)
        embed.addFields({
            name: 'Command input',
            value: (0, utils_1.limitStringLength)((0, utils_1.codeBlock)(context.toString(), 'ts'), 1024),
        });
    const stackMessage = error.name + whatCommand + ': ' + error.message.split('Require stack:').shift();
    embed.addFields({
        name: stackMessage,
        value: (0, utils_1.limitStringLength)((0, utils_1.codeBlock)(files || 'No files.', 'ts'), 1024),
    });
    await errorsChannel.send({
        content: client.owners?.[0].toString(),
        embeds: [embed],
    });
    if (!files)
        return;
    // TODO: Do not send data to DB until production-ready
    // await client.database.errors.add({
    //     _id: errorId,
    //     type: type,
    //     name: error.name,
    //     message: error.message,
    //     command: command?.name,
    //     files: code(files, 'ts'),
    // });
}
function isDjsAbortError(error) {
    return error.name === 'AbortError' && error.message === 'The user aborted a request.';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9lcnJvcnMvbm90aWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXVEO0FBRXZELHFFQUFvRDtBQUNwRCx1Q0FTcUI7QUFFckIsTUFBTSxrQkFBa0IsR0FBRyxvQkFBb0IsQ0FBQztBQUNoRCxNQUFNLFlBQVksR0FBRywwQ0FBMEMsQ0FBQztBQUNoRSxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQztBQUN2QyxNQUFNLFFBQVEsR0FBRyxjQUFXLENBQUMsSUFBSSxDQUFDO0FBRWxDLHlEQUF5RDtBQUN6RCxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDeEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUEscUJBQWEsR0FBRSxDQUFDO1FBRTNCLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ2YsY0FBYyxDQUFDLElBQUEseUJBQVcsRUFBQTtNQUNqQyxJQUFBLG1CQUFXLEVBQUMsT0FBTyxDQUFDO2tCQUNSLElBQUEscUJBQU8sRUFBQTtpQ0FDUSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssS0FBSyxFQUFFLEdBQUc7aUNBQ2hDLElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUM7aUJBQ3pEO0lBQ2IsQ0FBQzthQUNRLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxzQ0FBc0M7WUFDNUMsS0FBSyxFQUFF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