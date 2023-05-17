import { stripIndent, oneLine } from 'common-tags';
import { ApplicationCommandOptionChoiceData as ChoiceData } from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoAutocompleteInteraction,
    CommandoClient,
    ParseRawArguments,
    ReadonlyArgumentInfo,
    Util,
} from 'pixoll-commando';
import { basicEmbed, confirmButtons, reply } from '../../utils';

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
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ReasonCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'reason',
            group: 'mod-logs',
            description: 'Change the reason of a moderation log.',
            detailedDescription: stripIndent`
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
            await reply(context, basicEmbed({
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

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Updated reason for mod log \`${modLogId}\``,
            fieldValue: `**New reason:** ${reason}`,
        }));
    }

    public override async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { guild, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const documents = await guild?.database.moderations.fetchMany();
        const choices = documents
            ?.map<ChoiceData<string>>(doc => ({
                name: `[${Util.capitalize(doc.type)}] ${doc._id} (${doc.userTag})`,
                value: doc._id,
            }))
            .filter(doc => doc.name.toLowerCase().includes(query))
            .slice(0, 25) ?? [];
        await interaction.respond(choices);
    }
}
