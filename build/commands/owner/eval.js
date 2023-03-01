"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const util_1 = __importDefault(require("util"));
function escapeRegex(str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
const args = [{
        key: 'script',
        prompt: 'What code would you like to evaluate?',
        type: 'string',
    }];
class EvalCommand extends pixoll_commando_1.Command {
    _sensitivePattern;
    lastResult;
    constructor(client) {
        super(client, {
            name: 'eval',
            group: 'owner',
            description: 'Executes JavaScript code.',
            details: 'Only the bot owner(s) may use this command.',
            format: 'eval [script]',
            ownerOnly: true,
            hidden: true,
            guarded: true,
            args,
        });
        this.lastResult = null;
        this._sensitivePattern = null;
    }
    async run(context, { script }) {
        if (context.isInteraction())
            return;
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
        }
        catch (err) {
            return await context.reply(`Error while evaluating: \`${err}\``);
        }
        // Prepare for callback time and respond
        const result = this.makeResultMessages(this.lastResult, hrDiff, script);
        if (Array.isArray(result)) {
            return await Promise.all(result.map(item => context.reply(item)));
        }
        return await context.reply(result);
    }
    makeResultMessages(result, hrDiff, input = null) {
        const inspected = util_1.default.inspect(result, { depth: 0 })
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
            ? `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`
            : `*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`;
        return pixoll_commando_1.Util.splitMessage((0, common_tags_1.stripIndents) `
            ${replyHead}
            \`\`\`js
            ${inspected}
            \`\`\`
        `, { maxLength: 1900, prepend, append });
    }
    get sensitivePattern() {
        if (!this._sensitivePattern) {
            const client = this.client;
            let pattern = '';
            if (client.token)
                pattern += escapeRegex(client.token);
            this._sensitivePattern = new RegExp(pattern, 'gi');
        }
        return this._sensitivePattern;
    }
}
exports.default = EvalCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9vd25lci9ldmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQTJDO0FBRTNDLHFEQUFtRztBQUNuRyxnREFBd0I7QUFFeEIsU0FBUyxXQUFXLENBQUMsR0FBVztJQUM1QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUVELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSx1Q0FBdUM7UUFDL0MsSUFBSSxFQUFFLFFBQVE7S0FDakIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsV0FBWSxTQUFRLHlCQUF5QjtJQUNwRCxpQkFBaUIsQ0FBZ0I7SUFDakMsVUFBVSxDQUFVO0lBRTlCLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLDJCQUEyQjtZQUN4QyxPQUFPLEVBQUUsNkNBQTZDO1lBQ3RELE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7U0FDUCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxNQUFNLEVBQWM7UUFDNUQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQUUsT0FBTztRQUVwQyx1REFBdUQ7UUFDdkQsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0s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