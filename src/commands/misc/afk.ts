import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, reply } from '../../utils';

const args = [{
    key: 'status',
    prompt: 'What is the status you want to set? Respond with `off` to remove it (if existent).',
    type: 'string',
    max: 512,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class AfkCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'afk',
            group: 'misc',
            description: 'Set an AFK status to display when you are mentioned.',
            detailedDescription: 'Set `status` as `off` to remove your AFK status.',
            format: stripIndent`
                afk [status] - Set your status.
                afk off - Remove your status.
            `,
            examples: [
                'afk Coding',
                'afk off',
            ],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { status }: ParsedArgs): Promise<void> {
        const { author, guildId, guild } = context;
        const db = guild.database.afk;

        const afkStatus = await db.fetch({ guild: guildId, user: author.id });

        if (afkStatus) {
            if (status.toLowerCase() === 'off') {
                await db.delete(afkStatus);
                await reply(context, basicEmbed({
                    color: 'Green',
                    description: `Welcome back ${author.toString()}, I removed your AFK status`,
                }));
                return;
            }

            await db.update(afkStatus, { status });
            await reply(context, basicEmbed({
                color: 'Green',
                emoji: 'check',
                fieldName: 'I updated your AFK status to:',
                fieldValue: status,
            }));
            return;
        }

        if (status.toLowerCase() === 'off') {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'You can\'t set your status as `off`',
            }));
            return;
        }

        await db.add({
            guild: guildId,
            user: author.id,
            status,
        });

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: 'I set your AFK status as:',
            fieldValue: status,
        }));
    }
}
