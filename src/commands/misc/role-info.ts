import { stripIndent } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo } from 'pixoll-commando';
import { getKeyPerms, hyperlink, pixelColor, reply } from '../../utils';

const args = [{
    key: 'role',
    prompt: 'What role do you want to get information from?',
    type: 'role',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class RoleInfoCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'role-info',
            aliases: ['roleinfo'],
            group: 'misc',
            description: 'Displays multiple information about a role, such as color, position, members and mod permissions.',
            detailedDescription: '`role` can be either a role\'s name, mention or ID.',
            format: 'role-info [role]',
            examples: ['role-info Staff'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { role }: ParsedArgs): Promise<void> {
        const { hexColor, id, name, hoist, position, mentionable, members, createdTimestamp, unicodeEmoji } = role;
        const color = hexColor === '#000000' ? null : hexColor;
        const colorURL = color ? `https://www.colorhexa.com/${color.replace('#', '')}.png` : null;
        const url = role.iconURL({ size: 2048 }) || colorURL;
        const permissions = getKeyPerms(role);

        const roleInfo = new EmbedBuilder()
            .setColor(color || pixelColor)
            .setAuthor({ name: `Information for role: ${name}` })
            .setDescription(stripIndent`
                **Mention:** \`${role.toString()}\`
                **Color:** ${color && colorURL ? hyperlink(color, colorURL) : 'None'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Position:** ${position}
                **Members:** ${members.size}
            `)
            .setFooter({ text: `Role ID: ${id} • Created at` })
            .setTimestamp(createdTimestamp);

        if (url) roleInfo.setThumbnail(url);

        if (permissions !== 'None') roleInfo.addFields({
            name: 'Mod permissions',
            value: permissions,
        });

        await reply(context, roleInfo);
    }
}
