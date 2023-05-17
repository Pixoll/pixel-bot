import { stripIndent } from 'common-tags';
import {
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ApplicationCommandOptionType,
    ChannelType,
    ButtonStyle,
    ApplicationCommandOptionData,
    Role,
} from 'discord.js';
import {
    Argument,
    ArgumentType,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    ReadonlyArgumentInfo,
    Util,
} from 'pixoll-commando';
import {
    basicCollector,
    isValidRole,
    basicEmbed,
    reply,
    arrayWithLength,
    addOrdinalSuffix,
    parseArgInput,
    hyperlink,
    pixelColor,
    getContextMessage,
} from '../../utils';

const rolesAmount = 10;
const args = [{
    key: 'channel',
    prompt: 'On what channel do you want to create the button roles?',
    type: 'text-channel',
}, {
    key: 'roles',
    prompt: 'What roles do you want to set for the button roles?',
    type: 'string',
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const type = message.client.registry.types.get('role') as ArgumentType<'role'>;
        const queries = value?.split(/\s*,\s*/).slice(0, rolesAmount) ?? [];
        const valid: boolean[] = [];
        for (const query of queries) {
            const isValid1 = await type.validate(query, message, argument as Argument<'role'>);
            if (!isValid1) valid.push(false);
            const role = await type.parse(query, message, argument as Argument<'role'>);
            const isValid2 = isValidRole(message, role);
            valid.push(isValid2);
        }
        return valid.filter(b => b === true).length === 0;
    },
    error: 'None of the roles you specified were valid. Please try again.',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    [K in SlashRoleKey]?: Role;
} & {
    message?: string;
};

type SlashRoleKey = NumberedStringUnion<'role-', typeof rolesAmount>;

export default class ButtonRoleCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'button-role',
            aliases: ['brole', 'buttonrole'],
            group: 'managing',
            description: 'Create or remove button roles.',
            detailedDescription: stripIndent`
                \`channel\` can be either a channel's name, mention or ID.
                \`roles\` to be all the roles' names, mentions or ids, separated by commas (max. ${rolesAmount} at once).
            `,
            format: 'buttonrole [channel] [roles]',
            examples: ['buttonrole #roles Giveaways, Polls'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
                name: 'channel',
                description: 'On what channel do you want to create the button roles?',
                required: true,
            }, {
                type: ApplicationCommandOptionType.String,
                name: 'message',
                description: 'What message should I send with the buttons?',
                required: true,
            }, ...arrayWithLength<ApplicationCommandOptionData>(rolesAmount, (n) => ({
                type: ApplicationCommandOptionType.Role,
                name: `role-${n}`,
                description: `The ${addOrdinalSuffix(n)} role.`,
                required: n === 1,
            }))],
        });
    }

    public async run(context: CommandContext, args: ParsedArgs): Promise<void> {
        const { channel } = args;
        let content = args.message || '';
        const message = await getContextMessage<CommandoMessage>(context);
        const roles = await parseRoles(context, args, message, this);

        const { id } = message;

        if (context.isMessage()) {
            const msg = await basicCollector(context, {
                fieldName: 'What message should I send with the buttons?',
            }, { time: 2 * 60_000 });
            if (!msg) return;
            content = msg.content;
        }

        const embed = new EmbedBuilder()
            .setColor(pixelColor)
            .setDescription(content);

        const buttons: ButtonBuilder[] = [];
        for (const role of roles) {
            const style = buttons.length >= 5 ? ButtonStyle.Primary : ButtonStyle.Secondary;
            const button = new ButtonBuilder()
                .setCustomId(`button-role:${id}:${role.id}`)
                .setLabel(role.name)
                .setStyle(style);
            buttons.push(button);
        }

        const rows: Array<ActionRowBuilder<ButtonBuilder>> = [];
        while (buttons.length > 0) {
            const toAdd = rows.length === 1 ? buttons.splice(0, buttons.length).map(b => b.setStyle(ButtonStyle.Secondary))
                : buttons.splice(0, buttons.length <= 4 ? 4 : Math.round(buttons.length / 2 + 0.1))
                    .map(b => b.setStyle(ButtonStyle.Primary));

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...toAdd);
            rows.push(row);
        }

        const { url } = await channel.send({ embeds: [embed], components: rows });

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `The buttons roles were successfully created ${hyperlink('here', url)}.`,
        }));
    }
}

async function parseRoles(
    context: CommandContext, args: ParsedArgs, message: CommandoMessage, command: ButtonRoleCommand
): Promise<Role[]> {
    const results = context.isInteraction()
        ? Object.entries(args)
            .filter((entry): entry is [SlashRoleKey, Role] => /^role\d+$/.test(entry[0]))
            .map(([, role]) => role)
        : await Promise.all(args.roles.split(/ +/).map(query =>
            parseArgInput(query, message, command.argsCollector?.args[1] as Argument, 'role')
        ));
    return Util.filterNullishItems(results);
}
