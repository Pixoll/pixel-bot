import { oneLine, stripIndent } from 'common-tags';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { CommandoClient, CommandContext, Command } from 'pixoll-commando';
import EvalCommand from '../../commands/owner/eval';
import { customEmoji, generateDocId, code, replyAll, limitStringLength, hyperlink } from '../../utils';

const errorLogsChannelId = '906740370304540702';
const excludeStack = /node:(?:events|internal)|\(<anonymous>\)/;
const includeStack = /pixoll-commando/;
const evalName = EvalCommand.name;

/** A manager for all errors of the process and client */
export default function (client: CommandoClient<true>): void {
    client.on('commandError', async (command, error, instances) => {
        const owner = client.owners?.[0];
        const { serverInvite } = client.options;
        const id = generateDocId();

        const reply = new EmbedBuilder()
            .setColor('Red')
            .setDescription(stripIndent`
				${customEmoji('cross')} **An unexpected error happened**
                ${oneLine`
                Please contact ${owner?.toString()} (${owner?.tag})
                by joining the ${hyperlink('support server', serverInvite)}.
                `}
			`)
            .addFields({
                name: 'Please send this information as well',
                value: stripIndent`
                **Type:** ${error.name}
                **Error ID:** ${id}
                `,
            });

        await replyAll(instances, reply);
        await errorHandler(client, error, 'Command error', instances, command, id);
    })
        .on('error', error => errorHandler(client, error, 'Client error'))
        .on('warn', warn => errorHandler(client, warn, 'Client warn'))
        .on('invalidated', () => {
            client.emit('debug', 'The client\'s session has become invalidated, restarting the bot...');
            process.exit(1);
        });

    process.on('unhandledRejection', error => errorHandler(client, error as Error, 'Unhandled rejection'))
        .on('uncaughtException', error => errorHandler(client, error, 'Uncaught exception'))
        .on('uncaughtExceptionMonitor', error => errorHandler(client, error, 'Uncaught exception monitor'))
        .on('warning', error => errorHandler(client, error, 'Process warning'));
}

/**
 * sends the error message to the bot owner
 * @param error the error
 * @param type the type of error
 * @param context the command instances
 * @param command the command
 * @param errorId the error ID to use
 */
async function errorHandler(
    client: CommandoClient<true>,
    error: Error | string,
    type: string,
    context?: CommandContext,
    command?: Command,
    errorId?: string
): Promise<void> {
    const errorsChannel = await client.channels.fetch(errorLogsChannelId) as TextChannel;

    if (!(error instanceof Error)) {
        console.warn(error);

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(type)
            .setDescription(error);

        await errorsChannel.send({ embeds: [embed] });
        return;
    }

    if (command?.name === 'eval' || error.stack?.includes(evalName)) return;
    console.error(error);

    const length = error.name.length + error.message.length + 3;
    const stack = error.stack?.substring(length, error.stack?.length).replace(/ +/g, ' ').split('\n');

    const files = stack
        ?.filter(string =>
            excludeStack.test(string) ? includeStack.test(string) : true
        )
        .map((string) => '> ' + string
            .trim()
            .replace('at ', '')
            .replace(process.cwd(), '')
            .replace(/([\\]+)/g, '/')
            .replace('/node_modules/', '@')
            .replace('(@@', '(@')
        )
        .join('\n');

    const { guild = null, channel = null, author = null } = context ?? {};
    const url = context?.isMessage() ? context.url : null;

    const where = context ? (guild
        ? stripIndent`
        At guild **${guild.name}** (${guild.id}), channel ${channel?.toString()}.
        ${url ? `Please go to ${hyperlink('this message', url)} for more information.` : ''}
        `
        : `In DMs with ${author?.toString()} (${author?.tag}).`
    ) : '';

    const whatCommand = command ? ` at '${command.name}' command` : '';

    errorId ??= generateDocId();

    const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle(`${type}: \`${errorId}\``)
        .setDescription(stripIndent`
            ${customEmoji('cross')} **An unexpected error happened**
            ${where}
        `);

    if (command && context) embed.addFields({
        name: 'Command input',
        value: limitStringLength(code(context.toString(), 'ts'), 1024),
    });

    const stackMessage = error.name + whatCommand + ': ' + error.message.split('Require stack:').shift();
    embed.addFields({
        name: stackMessage,
        value: limitStringLength(code(files || 'No files.', 'ts'), 1024),
    });

    await errorsChannel.send({
        content: client.owners?.[0].toString(),
        embeds: [embed],
    });

    if (!files) return;

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
