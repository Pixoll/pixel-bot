"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const timestampRegex = /<t:\d+(?::\w)>/;
const mentionableRegex = /<[@#][!&]?\d+>/;
const guildEmojiRegex = /<:[^ :]+:\d+>/;
const invalidTextQueryRegex = (0, utils_1.mergeRegexps)(['g'], timestampRegex, mentionableRegex, guildEmojiRegex, utils_1.emojiRegex);
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
            await (0, utils_1.reply)(interaction, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Red',
            emoji: 'cross',
            fieldName: 'That text query is invalid.',
            fieldValue: 'Make sure to not over 1k characters long, and is not an URL, mention, timestamp or emoji.',
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
        value: (0, utils_1.codeBlock)(text),
    }, {
        name: `Output - Language: ${utils_1.bingSupportedLanguages[outputLang]}`,
        value: (0, utils_1.codeBlock)(result.translation),
    })
        .setFooter({
        text: 'Translated using Bing Translator',
    })
        .setTimestamp();
    await (0, utils_1.reply)(context, {
        embeds: [translatorEmbed],
    });
}
function isValidTextQuery(text) {
    return text.length <= 1000
        && !(0, utils_1.validateURL)(text)
        && text.replace(invalidTextQueryRegex, '').trim().length !== 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUtvQjtBQUNwQixxREFReUI7QUFDekIsdUNBYXFCO0FBRXJCLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO0FBQ3hDLE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFDMUMsTUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLE1BQU0scUJBQXFCLEdBQUcsSUFBQSxvQkFBWSxFQUFDLENBQUMsR0FBRyxDQUFDLEVBQzVDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsa0JBQWlCLENBQ3ZFLENBQUM7QUFFRixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsOENBQThDO1FBQ3RELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQXNCLENBQUM7S0FDN0MsRUFBRTtRQUNDLEdBQUcsRUFBRSxJQUFJO1FBQ1QsTUFBTSxFQUFFLDRDQUE0QztRQUNwRCxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUFzQixDQUFDO0tBQzdDLEVBQUU7UUFDQyxHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsSUFBSTtLQUNaLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsZ0JBQWlCLFNBQVEseUJBQXlCO0lBQ25FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSw4Q0FBOEM7WUFDM0Qs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