import { stripIndent, oneLine } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, confirmButtons, replyAll } from '../../utils';

const args = [{
    key: 'modLogId',
    label: 'mod-log ID',
    prompt: 'What is the ID of the mod log you want to change the duration?',
    type: 'string',
    max: 16,
}, {
    key: 'reason',
    prompt: 'What will be the new reason of the mod log?',
    type: 'string',
    max: 512,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ReasonCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'reason',
            group: 'mod-logs',
            description: 'Change the reason of a moderation log.',
            details: stripIndent`
                ${oneLine`
                    \`mod-log ID\` has to be a valid mod log ID.
                    To see all the mod logs in this server use the \`mod-logs\` command.
                `}
                \`new reason\` will be the new reason of the moderation log.
            `,
            format: 'reason [mod-log ID] [new reason]',
            examples: ['reason 186b2a4d2590270f Being racist'],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { modLogId, reason }: ParsedArgs): Promise<void> {
        const { guild } = context;
        const { moderations, active } = guild.database;

        const modLog = await moderations.fetch(modLogId);
        if (!modLog) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That ID is either invalid or it does not exist.',
            }));
            return;
        }

        const activeLog = await active.fetch(modLogId);

        const confirmed = await confirmButtons(context, {
            action: 'update mod log reason',
            target: modLogId,
            reason,
        });
        if (!confirmed) return;

        await moderations.update(modLog, { reason });
        if (activeLog) await active.update(activeLog, { reason });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Updated reason for mod log \`${modLogId}\``,
            fieldValue: `**New reason:** ${reason}`,
        }));
    }
}
