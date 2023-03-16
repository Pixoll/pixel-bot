import { stripIndent } from 'common-tags';
import {
    ApplicationCommandOptionChoiceData as ChoiceData,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    EmbedBuilder,
} from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoAutocompleteInteraction,
    CommandoClient,
    CommandoMessageContextMenuCommandInteraction,
    ParseRawArguments,
} from 'pixoll-commando';
import {
    BingLanguageId,
    bingSupportedLanguages,
    code,
    djsLocaleToBing,
    hyperlink,
    pixelColor,
    replyAll,
    translate,
} from '../../utils';

const args = [{
    key: 'from',
    prompt: 'What language do you want to translate from?',
    type: 'string',
    oneOf: Object.keys(bingSupportedLanguages),
}, {
    key: 'to',
    prompt: 'What language do you want to translate to?',
    type: 'string',
    oneOf: Object.keys(bingSupportedLanguages),
}, {
    key: 'text',
    prompt: 'What do you want to translate?',
    type: 'string',
    max: 1000,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TranslateCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'translate',
            group: 'misc',
            description: 'Translate text from one language to another.',
            /* eslint-disable indent */
            detailedDescription: stripIndent`
                \`from\` and \`to\` have to be a language ID.
                Available language IDs: ${Object.keys(bingSupportedLanguages).sort().map(k => `\`${k}\``).join(', ')}.
                Visit ${hyperlink(
                'this page', 'https://github.com/plainheart/bing-translate-api/blob/master/src/lang.json'
            )} to know which ID corresponds to what language.
            `,
            /* eslint-enable indent */
            format: 'translate [from] [to] [text]',
            examples: [
                'translate en es You\'re cool!',
                'translate ja en こんにちわ',
            ],
            args,
            contextMenuCommandTypes: [ApplicationCommandType.Message],
        }, {
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'text',
                description: 'What do you want to translate?',
                maxLength: 1000,
                required: true,
            }, {
                type: ApplicationCommandOptionType.String,
                name: 'from',
                description: 'What language do you want to translate from?',
                autocomplete: true,
            }, {
                type: ApplicationCommandOptionType.String,
                name: 'to',
                description: 'What language do you want to translate to?',
                autocomplete: true,
            }],
        });
    }

    public async run(context: CommandContext, { from, to, text }: ParsedArgs): Promise<void> {
        await runCommand(context, text, from, to);
    }

    public async runMessageContextMenu(interaction: CommandoMessageContextMenuCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        await runCommand(interaction, interaction.targetMessage.content);
    }

    public async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const query = interaction.options.getFocused().toLowerCase();
        const choices = Object.entries(bingSupportedLanguages)
            .filter(([key, value]) => `[${key}] ${value}`.toLowerCase().includes(query))
            .slice(0, 25)
            .map<ChoiceData<string>>(([key, value]) => ({
                name: `[${key}] ${value}`,
                value: key,
            }));

        await interaction.respond(choices);
    }
}

async function runCommand(
    context: CommandContext | CommandoMessageContextMenuCommandInteraction,
    text: string,
    from?: BingLanguageId | null,
    to?: BingLanguageId | null
): Promise<void> {
    const outputLang: BingLanguageId = to ?? ('locale' in context ? djsLocaleToBing(context.locale) : 'en');

    const result = await translate(text, { from, to: outputLang });
    const inputLang = !from || from === 'auto-detect' ? result.language.from as BingLanguageId : from;

    const translatorEmbed = new EmbedBuilder()
        .setColor(pixelColor)
        .addFields({
            name: `Input - Language: ${bingSupportedLanguages[inputLang]}`,
            value: code(text),
        }, {
            name: `Output - Language: ${bingSupportedLanguages[outputLang]}`,
            value: code(result.translation),
        })
        .setFooter({
            text: 'Translated using Bing Translator',
        })
        .setTimestamp();

    await replyAll(context, {
        embeds: [translatorEmbed],
    });
}
