import { ActionRowBuilder, StringSelectMenuBuilder, Collection } from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    DatabaseManager,
    ErrorSchema,
    ParseRawArguments,
} from 'pixoll-commando';
import { basicEmbed, generateEmbed, getSubCommand } from '../../utils/functions';

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
    isEmpty(_: string, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        return subCommand !== 'remove';
    },
    async validate(value: string, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (subCommand !== 'remove') return true;
        const isValid = await argument.type?.validate(value, message, argument) ?? true;
        return isValid;
    },
}] as const;

type SubCommand = Lowercase<typeof args[0]['oneOf'][number]>;
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ErrorsCommand extends Command<false, RawArgs> {
    protected readonly db: DatabaseManager<ErrorSchema>;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'errors',
            aliases: ['bugs'],
            group: 'owner',
            description: 'Displays all the errors that have happened in the bot.',
            ownerOnly: true,
            dmOnly: true,
            args,
        });

        this.db = this.client.database.errors;
    }

    public async run(context: CommandContext<false>, { subCommand, errorId }: ParsedArgs): Promise<void> {
        if (context.isInteraction()) return;

        const errors = await this.db.fetchMany();
        if (errors.size === 0) {
            await context.replyEmbed(basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There have been no errors or bugs lately.',
            }));
            return;
        }

        switch (subCommand) {
            case 'view':
                return await this.runView(context, errors);
            case 'remove':
                return await this.runRemove(context, errorId as string);
        }
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandoMessage<false>, errors: Collection<string, ErrorSchema>): Promise<void> {
        const errorsList = errors.map(doc => {
            const whatCommand = doc.command ? ` at '${doc.command}' command` : '';

            return {
                _id: doc._id,
                type: doc.type,
                message: doc.name + whatCommand + (doc.message ? (': ' + '``' + doc.message + '``') : ''),
                createdAt: doc.createdAt,
                files: doc.files,
            };
        });

        const filterMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(`${context.id}:menu`)
                .setMaxValues(1).setMinValues(1)
                .setPlaceholder('Filter...')
                .setOptions([
                    { label: 'All', value: 'all' },
                    { label: 'Command error', value: 'Command error' },
                    { label: 'Client error', value: 'Client error' },
                    { label: 'Unhandled rejection', value: 'Unhandled rejection' },
                    { label: 'Uncaught exception', value: 'Uncaught exception' },
                    { label: 'Uncaught exception monitor', value: 'Uncaught exception monitor' },
                    { label: 'Process warning', value: 'Process warning' },
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
    protected async runRemove(context: CommandoMessage<false>, errorId: string): Promise<void> {
        const doc = await this.db.fetch(errorId);
        if (!doc) {
            await context.replyEmbed(basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the error you were looking for.',
            }));
            return;
        }
        await this.db.delete(doc);

        await context.replyEmbed(basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Error with ID \`${doc._id}\` has been successfully removed.`,
        }));
    }
}
