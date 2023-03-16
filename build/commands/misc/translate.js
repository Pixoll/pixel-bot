"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
        await runCommand(interaction, interaction.targetMessage.content);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUtvQjtBQUNwQixxREFPeUI7QUFDekIsdUNBU3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSw4Q0FBOEM7UUFDdEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBc0IsQ0FBQztLQUM3QyxFQUFFO1FBQ0MsR0FBRyxFQUFFLElBQUk7UUFDVCxNQUFNLEVBQUUsNENBQTRDO1FBQ3BELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQXNCLENBQUM7S0FDN0MsRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdDQUFnQztRQUN4QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxJQUFJO0tBQ1osQ0FBVSxDQUFDO0FBS1osTUFBcUIsZ0JBQWlCLFNBQVEseUJBQXlCO0lBQ25FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSw4Q0FBOEM7WUFDM0QsMkJBQTJCO1lBQzNCLG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7MENBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBc0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUM1RixJQUFBLGlCQUFTLEVBQ2pCLFdBQVcsRUFBRSw0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