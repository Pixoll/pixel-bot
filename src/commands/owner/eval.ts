import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo, Util } from 'pixoll-commando';
import util from 'util';

function escapeRegex(str: string): string {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

const args = [{
    key: 'script',
    prompt: 'What code would you like to evaluate?',
    type: 'string',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class EvalCommand extends Command<boolean, RawArgs> {
    protected _sensitivePattern: RegExp | null;
    protected lastResult: unknown;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'eval',
            group: 'owner',
            description: 'Executes JavaScript code.',
            detailedDescription: 'Only the bot owner(s) may use this command.',
            format: 'eval [script]',
            ownerOnly: true,
            hidden: true,
            guarded: true,
            args,
        });

        this.lastResult = null;
        this._sensitivePattern = null;
    }

    public async run(context: CommandContext, { script }: ParsedArgs): Promise<Message | Message[] | undefined> {
        if (context.isInteraction()) return;

        // Remove any surrounding code blocks before evaluation
        if (script.startsWith('```') && script.endsWith('```')) {
            script = script.replace(/(^.*?\s)|(\n.*$)/g, '');
        }

        // Run the code and measure its execution time
        let hrDiff;
        try {
            const hrStart = process.hrtime();
            // eslint-disable-next-line no-eval
            this.lastResult = eval(script);
            hrDiff = process.hrtime(hrStart);
        } catch (err) {
            return await context.reply(`Error while evaluating: \`${err}\``);
        }

        // Prepare for callback time and respond
        const result = this.makeResultMessages(this.lastResult, hrDiff, script);
        if (Array.isArray(result)) {
            return await Promise.all(result.map(item => context.reply(item)));
        }
        return await context.reply(result);
    }

    protected makeResultMessages(result: unknown, hrDiff: Tuple<number, 2>, input: string | null = null): string[] {
        const inspected = util.inspect(result, { depth: 0 })
            .replace(/!!NL!!/g, '\n')
            .replace(this.sensitivePattern, '--snip--')
            .replace(escapeRegex(`/${this.client.token}/gi`), '--snip--');
        const split = inspected.split('\n');
        const last = inspected.length - 1;
        const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ? split[0] : inspected[0];
        const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\''
            ? split[split.length - 1]
            : inspected[last];
        const prepend = `\`\`\`js\n${prependPart}\n`;
        const append = `\n${appendPart}\n\`\`\``;
        const replyHead = input
            ? `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1_000_000}ms.*`
            : `*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1_000_000}ms.*`;
        return Util.splitMessage(stripIndents`
            ${replyHead}
            \`\`\`js
            ${inspected}
            \`\`\`
        `, { maxLength: 1900, prepend, append });
    }

    protected get sensitivePattern(): RegExp {
        if (!this._sensitivePattern) {
            const client = this.client;
            let pattern = '';
            if (client.token) pattern += escapeRegex(client.token);
            this._sensitivePattern = new RegExp(pattern, 'gi');
        }
        return this._sensitivePattern;
    }
}
