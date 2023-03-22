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
        await errorHandler(client, error, utils_1.errorTypeMap.command, instances, command, id);
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
 * @param context the command instances
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
    if (command?.name === 'eval' || error.stack?.includes(evalName))
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
            value: (0, utils_1.limitStringLength)((0, utils_1.code)(context.toString(), 'ts'), 1024),
        });
    const stackMessage = error.name + whatCommand + ': ' + error.message.split('Require stack:').shift();
    embed.addFields({
        name: stackMessage,
        value: (0, utils_1.limitStringLength)((0, utils_1.code)(files || 'No files.', 'ts'), 1024),
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
    //     files: code(files),
    // });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9lcnJvcnMvbm90aWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXVEO0FBRXZELHFFQUFvRDtBQUNwRCx1Q0FTcUI7QUFFckIsTUFBTSxrQkFBa0IsR0FBRyxvQkFBb0IsQ0FBQztBQUNoRCxNQUFNLFlBQVksR0FBRywwQ0FBMEMsQ0FBQztBQUNoRSxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQztBQUN2QyxNQUFNLFFBQVEsR0FBRyxjQUFXLENBQUMsSUFBSSxDQUFDO0FBRWxDLHlEQUF5RDtBQUN6RCxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUU7UUFDMUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUEscUJBQWEsR0FBRSxDQUFDO1FBRTNCLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ2YsY0FBYyxDQUFDLElBQUEseUJBQVcsRUFBQTtNQUNqQyxJQUFBLG1CQUFXLEVBQUMsT0FBTyxDQUFDO2tCQUNSLElBQUEscUJBQU8sRUFBQTtpQ0FDUSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssS0FBSyxFQUFFLEdBQUc7aUNBQ2hDLElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUM7aUJBQ3pEO0lBQ2IsQ0FBQzthQUNRLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxzQ0FBc0M7WUFDNUMsS0FBSyxFQUFF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