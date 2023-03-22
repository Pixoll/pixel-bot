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
    return text.length <= 1000
        && !(0, utils_1.validateURL)(text)
        && text.replace(invalidTextQueryRegex, '').trim().length !== 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUtvQjtBQUNwQixxREFPeUI7QUFDekIsdUNBYXFCO0FBRXJCLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO0FBQ3hDLE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFDMUMsTUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLE1BQU0scUJBQXFCLEdBQUcsSUFBQSxvQkFBWSxFQUFDLENBQUMsR0FBRyxDQUFDLEVBQzVDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsa0JBQWlCLENBQ3ZFLENBQUM7QUFFRixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsOENBQThDO1FBQ3RELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQXNCLENBQUM7S0FDN0MsRUFBRTtRQUNDLEdBQUcsRUFBRSxJQUFJO1FBQ1QsTUFBTSxFQUFFLDRDQUE0QztRQUNwRCxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUFzQixDQUFDO0tBQzdDLEVBQUU7UUFDQyxHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxnQ0FBZ0M7UUFDeEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsSUFBSTtLQUNaLENBQVUsQ0FBQztBQUtaLE1BQXFCLGdCQUFpQixTQUFRLHlCQUF5QjtJQUNuRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFdBQVc7WUFDakIsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsOENBQThDO1lBQzNELDJC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