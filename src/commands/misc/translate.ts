import { oneLine, stripIndent } from 'common-tags';
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
    Util,
} from 'pixoll-commando';
import {
    code,
    djsLocaleToGoogle,
    GoogleLanguageId,
    googleSupportedLanguages,
    hyperlink,
    pixelColor,
    replyAll,
    translate,
} from '../../utils';

const args = [{
    key: 'from',
    prompt: 'What language do you want to translate from?',
    type: 'string',
    oneOf: Object.keys(googleSupportedLanguages),
}, {
    key: 'to',
    prompt: 'What language do you want to translate to?',
    type: 'string',
    oneOf: Object.keys(googleSupportedLanguages),
}, {
    key: 'text',
    prompt: 'What do you want to translate?',
    type: 'string',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TranslateCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'translate',
            group: 'misc',
            description: 'Translate text from one language to another.',
            detailedDescription: stripIndent`
                \`from\` and \`to\` have to be a language ID.
                Available language IDs: ${Object.keys(googleSupportedLanguages).sort().map(k => `\`${k}\``).join(', ')}.
                ${oneLine`
                Visit ${hyperlink('this website', 'https://cloud.google.com/translate/docs/languages')} to know
                which ID corresponds to what language.
                `}
            `,
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
        const choices = Object.entries(Util.omit(googleSupportedLanguages, ['zh', 'iw', 'jw']))
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
    from?: GoogleLanguageId | null,
    to?: GoogleLanguageId | null
): Promise<void> {
    from ??= 'auto';
    to ??= 'locale' in context ? djsLocaleToGoogle(context.locale) : 'en';

    const translation = await translate(text, { from, to });
    console.log(text, translation);
    const inputLang = translation.raw.ld_result.srclangs[0] as GoogleLanguageId;

    const translatorEmbed = new EmbedBuilder()
        .setColor(pixelColor)
        .addFields({
            name: `Input - Language: ${googleSupportedLanguages[inputLang]}`,
            value: code(text),
        }, {
            name: `Output - Language: ${googleSupportedLanguages[to ?? 'en']}`,
            value: code(translation.text),
        })
        .setTimestamp();

    await replyAll(context, {
        embeds: [translatorEmbed],
    });
}
