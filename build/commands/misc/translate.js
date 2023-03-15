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
        oneOf: Object.keys(utils_1.googleSupportedLanguages),
    }, {
        key: 'to',
        prompt: 'What language do you want to translate to?',
        type: 'string',
        oneOf: Object.keys(utils_1.googleSupportedLanguages),
    }, {
        key: 'text',
        prompt: 'What do you want to translate?',
        type: 'string',
    }];
class TranslateCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'translate',
            group: 'misc',
            description: 'Translate text from one language to another.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`from\` and \`to\` have to be a language ID.
                Available language IDs: ${Object.keys(utils_1.googleSupportedLanguages).sort().map(k => `\`${k}\``).join(', ')}.
                ${(0, common_tags_1.oneLine) `
                Visit ${(0, utils_1.hyperlink)('this website', 'https://cloud.google.com/translate/docs/languages')} to know
                which ID corresponds to what language.
                `}
            `,
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
        const choices = Object.entries(pixoll_commando_1.Util.omit(utils_1.googleSupportedLanguages, ['zh', 'iw', 'jw']))
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
    from ??= 'auto';
    to ??= 'locale' in context ? (0, utils_1.djsLocaleToGoogle)(context.locale) : 'en';
    const translation = await (0, utils_1.translate)(text, { from, to });
    console.log(text, translation);
    const inputLang = translation.raw.ld_result.srclangs[0];
    const translatorEmbed = new discord_js_1.EmbedBuilder()
        .setColor(utils_1.pixelColor)
        .addFields({
        name: `Input - Language: ${utils_1.googleSupportedLanguages[inputLang]}`,
        value: (0, utils_1.code)(text),
    }, {
        name: `Output - Language: ${utils_1.googleSupportedLanguages[to ?? 'en']}`,
        value: (0, utils_1.code)(translation.text),
    })
        .setTimestamp();
    await (0, utils_1.replyAll)(context, {
        embeds: [translatorEmbed],
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQW1EO0FBQ25ELDJDQUtvQjtBQUNwQixxREFReUI7QUFDekIsdUNBU3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSw4Q0FBOEM7UUFDdEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxnQ0FBd0IsQ0FBQztLQUMvQyxFQUFFO1FBQ0MsR0FBRyxFQUFFLElBQUk7UUFDVCxNQUFNLEVBQUUsNENBQTRDO1FBQ3BELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQXdCLENBQUM7S0FDL0MsRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdDQUFnQztRQUN4QyxJQUFJLEVBQUUsUUFBUTtLQUNqQixDQUFVLENBQUM7QUFLWixNQUFxQixnQkFBaUIsU0FBUSx5QkFBeUI7SUFDbkUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxXQUFXO1lBQ2pCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLDhDQUE4QztZQUMzRCxtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzBDQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQXdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztrQkFDcEcsSUFBQSxxQkFBTyxFQUFBO3dCQUNELElBQUEsaUJBQVMsRUFBQyxjQUFjLEVBQUUsbURBQW1ELENBQUM7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