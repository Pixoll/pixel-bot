import {
    Command,
    CommandContext,
    CommandoClient,
    ParseRawArguments,
    SimplifiedSchemas,
    Util,
} from 'pixoll-commando';
import { generateEmbed, basicEmbed } from '../../utils/functions';

type CollectionName = keyof SimplifiedSchemas;
const args = (options: CollectionName[]) => [{
    key: 'collection',
    prompt: 'What collection do you want to manage?',
    type: 'string',
    oneOf: options,
}] as const;

type RawArgs = ReturnType<typeof args>;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class DatabaseCommand extends Command<false, RawArgs> {
    public constructor(client: CommandoClient) {
        const databaseOptions: CollectionName[] = Object.keys(client.databaseSchemas);

        super(client, {
            name: 'database',
            aliases: ['db'],
            group: 'owner',
            description: 'Manage the database.',
            ownerOnly: true,
            dmOnly: true,
            args: args(databaseOptions),
        });
    }

    public async run(context: CommandContext<false>, { collection }: ParsedArgs): Promise<void> {
        if (context.isInteraction()) return;
        const { client } = context;

        const rawData = await client.databaseSchemas[collection].find({});
        const dataArray = rawData.map((doc) => {
            type Doc = { _doc: typeof doc & { __v: unknown } } | typeof doc & { __v: unknown };
            const rawDocument = doc as Doc;
            const parsedDocument = '_doc' in rawDocument ? rawDocument._doc : rawDocument;
            return Util.omit(parsedDocument, ['_id', 'updatedAt', '__v']);
        });

        const DBname = collection.replace('Model', ' ');

        if (dataArray.length === 0) {
            await context.replyEmbed(basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: `The ${DBname} collection is empty.`,
            }));
            return;
        }

        await generateEmbed(context, dataArray, {
            authorName: `Database: ${DBname}`,
            authorIconURL: client.user.displayAvatarURL({ forceStatic: false }),
            title: 'Document',
            keysExclude: ['updatedAt'],
        });
    }
}
