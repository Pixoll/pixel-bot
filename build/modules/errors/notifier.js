"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const errorLogsChannelId = '906740370304540702';
const excludeStack = /node:(?:events|internal)/;
const includeStack = /pixoll-commando/;
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
    if (command?.name === 'eval')
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
        .replace(/([\\]+)/g, '/'))
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
            value: (0, utils_1.limitStringLength)((0, utils_1.code)(context.toString(), 'js'), 1024),
        });
    const stackMessage = error.name + whatCommand + ': ' + error.message.split('Require stack:').shift();
    embed.addFields({
        name: stackMessage,
        value: (0, utils_1.limitStringLength)((0, utils_1.code)(files || 'No files.', 'js'), 1024),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9lcnJvcnMvbm90aWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXVEO0FBRXZELHVDQUF1RztBQUV2RyxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0FBQ2hELE1BQU0sWUFBWSxHQUFHLDBCQUEwQixDQUFDO0FBQ2hELE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDO0FBRXZDLHlEQUF5RDtBQUN6RCxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUU7UUFDMUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUEscUJBQWEsR0FBRSxDQUFDO1FBRTNCLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ2YsY0FBYyxDQUFDLElBQUEseUJBQVcsRUFBQTtNQUNqQyxJQUFBLG1CQUFXLEVBQUMsT0FBTyxDQUFDO2tCQUNSLElBQUEscUJBQU8sRUFBQTtpQ0FDUSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssS0FBSyxFQUFFLEdBQUc7aUNBQ2hDLElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUM7aUJBQ3pEO0lBQ2IsQ0FBQzthQUNRLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxzQ0FBc0M7WUFDNUMsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTs0QkFDTixLQUFLLENBQUMsSUFBSTtnQ0FDTixFQUFFO2lCQUNqQjtT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