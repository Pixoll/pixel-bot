import { stripIndent } from 'common-tags';
import { Role } from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    ReadonlyArgumentInfo,
} from 'pixoll-commando';
import { timestamp, isValidRole, reply, basicEmbed, generateDocId, parseArgDate } from '../../utils';

const args = [{
    key: 'role',
    prompt: 'What role would you want to give then?',
    type: 'role',
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        if (typeof value === 'undefined') return false;
        const isValid = await argument.type?.validate(value, message, argument) ?? true;
        if (isValid !== true) return isValid;
        const role = await argument.type?.parse(value, message, argument) as Role | undefined;
        return isValidRole(message, role);
    },
}, {
    key: 'member',
    prompt: 'What member do you want to give the role?',
    type: 'member',
}, {
    key: 'duration',
    prompt: 'How long should this role last?',
    type: ['date', 'duration'],
}, {
    key: 'reason',
    prompt: 'Why are you\'re giving them the role?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class TempRoleCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'temp-role',
            aliases: ['temprole'],
            group: 'mod',
            description: 'Assign a role that persists for a limited time.',
            detailedDescription: stripIndent`
                \`role\` can be either a role's name, mention or ID.
                \`member\` can be either a member's name, mention or ID.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'temp-role [role] [member] [duration] <reason>',
            examples: ['temp-role Moderator Pixoll 1d'],
            clientPermissions: ['ManageRoles'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(
        context: CommandContext<true>, { member: passedMember, duration, role, reason }: ParsedArgs
    ): Promise<void> {
        const { guild, guildId, author } = context;
        const member = await guild.members.fetch(passedMember.id).catch(() => null);
        if (!member) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        if (!isValidRole(context, role)) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That is not a valid manageable role.',
            }));
            return;
        }

        const { roles, user } = member;
        const parsedDuration = await parseArgDate(context, this as Command, 2, duration);
        if (!parsedDuration) return;

        duration = parsedDuration;
        reason ??= 'No reason given.';
        if (typeof duration === 'number') duration = duration + Date.now();
        if (duration instanceof Date) duration = duration.getTime();

        if (roles.cache.has(role.id)) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That member already has that role.',
            }));
            return;
        }

        await roles.add(role.id, reason);

        if (!user.bot) await user.send({
            embeds: [basicEmbed({
                color: 'Gold',
                fieldName: `You have been given the \`${role.name}\` role on ${guild.name}`,
                fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R', true)}
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
                `,
            })],
        }).catch(() => null);

        await guild.database.active.add({
            _id: generateDocId(),
            type: 'temp-role',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            role: role.id,
            duration,
        });

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Added role \`${role.name}\` to ${user.tag}`,
            fieldValue: stripIndent`
            **Expires:** ${timestamp(duration, 'R', true)}
            **Reason:** ${reason}
            `,
        }));
    }
}
