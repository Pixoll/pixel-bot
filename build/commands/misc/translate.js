"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const timestampRegex = /<t:\d+(?::\w)>/;
const mentionableRegex = /<[@#][!&]?\d+>/;
const guildEmojiRegex = /<:[^ :]+:\d+>/;
const invalidTextQueryRegex = (0, utils_1.mergeRegexps)([], timestampRegex, mentionableRegex, guildEmojiRegex, utils_1.emojiRegex);
const args = [{
        key: 'from',
        prompt: 'What language do you want to translate from?',
        type: 'string',
        oneOf: Object.keys(utils_1.bingSupportedLanguages),
    }, {
        key: 'to',
        prompt: 'What language do you want to translate to?',
        type: 'string',
        oneOf: Object.keys(utils_1.bingSupportedLanguages),
    }, {
        key: 'text',
        prompt: 'What do you want to translate?',
        type: 'string',
        max: 1000,
    }];
class TranslateCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'translate',
            group: 'misc',
            description: 'Translate text from one language to another.',
            /* eslint-disable indent */
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`from\` and \`to\` have to be a language ID.
                Available language IDs: ${Object.keys(utils_1.bingSupportedLanguages).sort().map(k => `\`${k}\``).join(', ')}.
                Visit ${(0, utils_1.hyperlink)('this page', 'https://github.com/plainheart/bing-translate-api/blob/master/src/lang.json')} to know which ID corresponds to what language.
            `,
            /* eslint-enable indent */
            format: 'translate [from] [to] [text]',
            examples: [
                'translate en es You\'re cool!',
                'translate ja en こんにちわ',
            ],
            args,
            contextMenuCommandTypes: [discord_js_1.ApplicationCommandType.Message],
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'text',
                    description: 'What do you want to translate?',
                    maxLength: 1000,
                    required: true,
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'from',
                    description: 'What language do you want to translate from?',
                    autocomplete: true,
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'to',
                    description: 'What language do you want to translate to?',
                    autocomplete: true,
                }],
        });
    }
    async run(context, { from, to, text }) {
        await runCommand(context, text, from, to);
    }
    async runMessageContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const { content } = interaction.targetMessage;
        if (!content) {
            await (0, utils_1.replyAll)(interaction, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'That message has no plain text content.',
                fieldValue: 'Make sure to not use this command in a message that has only attachments, embeds or stickers.',
            }));
            return;
        }
        await runCommand(interaction, content);
    }
    async runAutocomplete(interaction) {
        const query = interaction.options.getFocused().toLowerCase();
        const choices = Object.entries(utils_1.bingSupportedLanguages)
            .filter(([key, value]) => `[${key}] ${value}`.toLowerCase().includes(query))
            .slice(0, 25)
            .map(([key, value]) => ({
            name: `[${key}] ${value}`,
            value: key,
        }));
        await interaction.respond(choices);
    }
}
exports.default = TranslateCommand;
async function runCommand(context, text, from, to) {
    if (!isValidTextQuery(text)) {
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Red',
            emoji: 'cross',
            fieldName: 'That text query is invalid.',
            fieldValue: 'Make sure to not an URL, mention, timestamp or emoji.',
        }));
        return;
    }
    const outputLang = to ?? ('locale' in context ? (0, utils_1.djsLocaleToBing)(context.locale) : 'en');
    const result = await (0, utils_1.translate)(text, { from, to: outputLang });
    const inputLang = !from || from === 'auto-detect' ? result.language.from : from;
    const translatorEmbed = new discord_js_1.EmbedBuilder()
        .setColor(utils_1.pixelColor)
        .addFields({
        name: `Input - Language: ${utils_1.bingSupportedLanguages[inputLang]}`,
        value: (0, utils_1.code)(text),
    }, {
        name: `Output - Language: ${utils_1.bingSupportedLanguages[outputLang]}`,
        value: (0, utils_1.code)(result.translation),
    })
        .setFooter({
        text: 'Translated using Bing Translator',
    })
        .setTimestamp();
    await (0, utils_1.replyAll)(context, {
        embeds: [translatorEmbed],
    });
}
function isValidTextQuery(text) {
    return !(0, utils_1.validateURL)(text)
        && text.replace(new RegExp(invalidTextQueryRegex, 'g'), '').trim().length !== 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUtvQjtBQUNwQixxREFPeUI7QUFDekIsdUNBYXFCO0FBRXJCLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO0FBQ3hDLE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFDMUMsTUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLE1BQU0scUJBQXFCLEdBQUcsSUFBQSxvQkFBWSxFQUFDLEVBQUUsRUFDekMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxrQkFBaUIsQ0FDdkUsQ0FBQztBQUVGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSw4Q0FBOEM7UUFDdEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBc0IsQ0FBQztLQUM3QyxFQUFFO1FBQ0MsR0FBRyxFQUFFLElBQUk7UUFDVCxNQUFNLEVBQUUsNENBQTRDO1FBQ3BELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQXNCLENBQUM7S0FDN0MsRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdDQUFnQztRQUN4QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxJQUFJO0tBQ1osQ0FBVSxDQUFDO0FBS1osTUFBcUIsZ0JBQWlCLFNBQVEseUJBQXlCO0lBQ25FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSw4Q0FBOEM7WUFDM0QsMkJBQTJCO1lBQzNC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