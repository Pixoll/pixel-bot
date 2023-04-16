import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandOptionChoiceData as ChoiceData,
    SelectMenuComponentOptionData,
} from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoAutocompleteInteraction,
    CommandoClient,
    CommandoMessage,
    DatabaseManager,
    ErrorSchema,
    ParseRawArguments,
    Util,
} from 'pixoll-commando';
import { basicEmbed, errorTypeMap, generateEmbed, getSubCommand, limitStringLength, reply } from '../../utils';

const args = [{
    key: 'subCommand',
    prompt: 'Do you want to filter or remove an error/bug?',
    type: 'string',
    oneOf: ['view', 'remove'],
    default: 'view',
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'errorId',
    label: 'error ID',
    prompt: 'What specific error do you want to remove?',
    type: 'string',
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        return subCommand !== 'remove';
    },
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (subCommand !== 'remove') return true;
        const isValid = await argument.type?.validate(value, message, argument) ?? true;
        return isValid;
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
type SubCommand = ParsedArgs['subCommand'];

export default class ErrorsCommand extends Command<true, RawArgs> {
    protected readonly db: DatabaseManager<ErrorSchema>;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'errors',
            aliases: ['bugs'],
            group: 'owner',
            description: 'Displays all the errors that have happened in the bot.',
            hidden: true,
            guarded: true,
            ownerOnly: true,
            guildOnly: true,
            testAppCommand: true,
            userPermissions: ['Administrator'],
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'View all error/bug records.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'remove',
                description: 'Remove a error/bug record.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'error-id',
                    description: 'What specific error do you want to remove?',
                    required: true,
                    autocomplete: true,
                }],
            }],
        });

        this.db = this.client.database.errors;
    }

    public async run(context: CommandContext<true>, { subCommand, errorId }: ParsedArgs): Promise<void> {
        switch (subCommand) {
            case 'view':
                return await this.runView(context);
            case 'remove':
                return await this.runRemove(context, errorId as string);
        }
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandContext<true>): Promise<void> {
        const errors = await this.db.fetchMany();
        if (errors.size === 0) {
            await reply(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There have been no errors or bugs lately.',
            }));
            return;
        }

        const errorsList = errors.map(error => {
            const whatCommand = error.command ? ` at '${error.command}' command` : '';

            return {
                _id: error._id,
                type: error.type,
                message: error.name + whatCommand + ': ' + '``' + error.message + '``',
                createdAt: error.createdAt,
                files: error.files,
            };
        });

        const filterMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(`${context.id}:menu`)
                .setMinValues(1)
                .setMaxValues(1)
                .setPlaceholder('Filter...')
                .setOptions([{
                    label: 'All',
                    value: 'all',
                }, ...Object.values(Util.omit(errorTypeMap, ['warn']))
                    .map<SelectMenuComponentOptionData>(type => ({
                        label: type,
                        value: type,
                    })),
                ])
            );

        await generateEmbed(context, errorsList, {
            number: 3,
            authorName: 'Errors and bugs list',
            authorIconURL: context.client.user.displayAvatarURL({ forceStatic: false }),
            title: ' •  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['type', '_id'],
            useDocId: true,
            components: [filterMenu],
        });
    }

    /**
     * The `remove` sub-command
     */
    protected async runRemove(context: CommandContext<true>, errorId: string): Promise<void> {
        const doc = await this.db.fetch(errorId);
        if (!doc) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the error you were looking for.',
            }));
            return;
        }
        await this.db.delete(doc);

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Error with ID \`${doc._id}\` has been successfully removed.`,
        }));
    }

    public async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { options } = interaction;
        const query = options.getFocused().toLowerCase();
        const errors = await this.db.fetchMany();
        const possibleItems = errors
            .map(error => ({
                id: error._id,
                message: `[${error._id}] ${error.type}: ${error.message}`,
            }))
            .filter(error => error.message.toLowerCase().includes(query))
            .slice(0, 25)
            .map<ChoiceData<string>>(error => ({
                name: limitStringLength(error.message, 100),
                value: error.id,
            }));
        await interaction.respond(possibleItems);
    }
}
