import { EmbedBuilder } from 'discord.js';
import { capitalize } from 'lodash';
import { Command, CommandContext, CommandoClient, ModuleSchema, Util } from 'pixoll-commando';
import { replyAll, customEmoji, basicEmbed, addDashes, abcOrder } from '../../utils';

function getStatusString(isOn?: boolean): string {
    if (isOn === true) return `Enabled ${customEmoji('online')}`;
    return `Disabled ${customEmoji('dnd')}`;
}

function mapModuleData(data: Partial<ModuleSchema>): string {
    return Object.entries(Util.omit(data, [
        '__v', '_id', 'guild',
    ])).sort(([key1], [key2, value]) =>
        typeof value === 'boolean' ? abcOrder(key1, key2) : -1
    ).map(([key, value]) => {
        if (typeof value === 'boolean') {
            return `**${capitalize(addDashes(key).replace(/-/g, ' '))}:** ${getStatusString(value)}`;
        }
        return [`**${capitalize(addDashes(key).replace(/-/g, ' '))}:**`, Object.entries(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            value ?? {} as NonNullable<typeof value>
        ).map(([nestedKey, nestedValue]) =>
            `\u2800⤷ **${capitalize(addDashes(nestedKey))}:** ${getStatusString(nestedValue)}`
        ).join('\n')].join('\n');
    }).join('\n');
}

export default class ModulesCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'modules',
            group: 'utility',
            description: 'Check the status of all available modules and sub-modules.',
            modPermissions: true,
            guarded: true,
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;

        const data = await guild.database.modules.fetch();
        if (!data) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }

        const moduleStatsString = mapModuleData(data);

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${guild.name}'s modules and sub-modules`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(moduleStatsString)
            .setTimestamp();

        await replyAll(context, embed);
    }
}
