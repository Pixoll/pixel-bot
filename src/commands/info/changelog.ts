import { Command, CommandContext, CommandoClient, Util } from 'pixoll-commando';
import { generateEmbed, alphabeticalOrder, timestamp } from '../../utils';

declare function require<T>(id: string): T;

interface ChangeLog {
    version: string;
    changes: string[];
    timestamp?: number;
}

const { version } = require<{ version: string }>('../../../package.json');

const changelog = Util.filterNullishItems(require<ChangeLog[]>('../../../documents/changelog.json')
    .sort(alphabeticalOrder({
        sortKey: 'version',
    }))
    .map(log => {
        if (version < log.version) return null;
        const changes = log.changes.length === 1
            ? log.changes[0]
            : log.changes.map((change, i) => `**${i + 1}.** ${change}`).join('\n');

        const title = `Version ${log.version} - ${log.timestamp
            ? timestamp(log.timestamp, 'F', true)
            : 'No date specified'}`;

        return {
            title,
            changes,
        };
    }));

export default class ChangelogCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'changelog',
            group: 'info',
            description: 'Displays the changelog history of the bot.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const { user } = context.client;
        await generateEmbed(context, changelog, {
            number: 5,
            authorName: `${user.username}'s changelog`,
            authorIconURL: user.displayAvatarURL({ forceStatic: false }),
            keyTitle: { suffix: 'title' },
            keys: ['changes'],
        });
    }
}
