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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9vd25lci9ldmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQTJDO0FBRTNDLHFEQUFtRztBQUNuRyxnREFBd0I7QUFFeEIsU0FBUyxXQUFXLENBQUMsR0FBVztJQUM1QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUVELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSx1Q0FBdUM7UUFDL0MsSUFBSSxFQUFFLFFBQVE7S0FDakIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsV0FBWSxTQUFRLHlCQUF5QjtJQUNwRCxpQkFBaUIsQ0FBZ0I7SUFDakMsVUFBVSxDQUFVO0lBRTlCLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLDJCQUEyQjtZQUN4QyxtQkFBbUIsRUFBRSw2Q0FBNkM7WUFDbEUsTUFBTSxFQUFFLGVBQWU7WUFDdkIsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSTtTQUNQLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7SUFDbEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLE1BQU0sRUFBYztRQUM1RCxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFBRSxPQUFPO1FBRXBDLHVEQUF1RDtRQUN2RCxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksTUFB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