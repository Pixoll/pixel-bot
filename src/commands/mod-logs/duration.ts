import { ms } from 'better-ms';
import { stripIndent, oneLine } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, confirmButtons, parseArgDate, replyAll } from '../../utils';

const args = [{
    key: 'modLogId',
    label: 'mod-log ID',
    prompt: 'What is the ID of the mod log you want to change the duration?',
    type: 'string',
    max: 16,
}, {
    key: 'duration',
    prompt: 'What will be the new duration of the mod log?',
    type: ['date', 'duration'],
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class DurationCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'duration',
            group: 'mod-logs',
            description: 'Change the duration of a punishment.',
            details: stripIndent`
                ${oneLine`
                \`mod-log ID ID\` has to be a valid mod log ID.
                To see all the mod logs in this server use the \`mod-logs\` command.
                `}
                \`new duration\` uses the bot's time formatting, for more information use the \`help\` command.
            `,
            format: 'duration [mod-log ID] [new duration]',
            examples: [
                'duration 123456abcdef 12/30/2022',
                'duration 186b2a4d2590270f 30d',
            ],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { modLogId, duration }: ParsedArgs): Promise<void> {
        const parsedDuration = await parseArgDate(context, this as Command, 1, duration);
        if (!parsedDuration) return;

        const { guild } = context;
        const { moderations, active } = guild.database;

        const modLog = await moderations.fetch(modLogId);
        if (!modLog) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'I could not find the mod-log you were looking for.',
            }));
            return;
        }

        const activeLog = await active.fetch(modLogId);
        if (!activeLog) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That punishment has expired.',
            }));
            return;
        }

        if (typeof duration === 'number') duration = duration + Date.now();
        if (duration instanceof Date) duration = duration.getTime();

        const longTime = ms(duration - Date.now(), { long: true });

        const confirmed = await confirmButtons(context, {
            action: 'update mod log duration',
            target: modLogId,
            duration: longTime,
        });
        if (!confirmed) return;

        await moderations.update(modLog, { duration: longTime });
        await active.update(activeLog, { duration });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Updated duration for mod log \`${modLogId}\``,
            fieldValue: `**New duration:** ${longTime}`,
        }));
    }
}
