import { ApplicationCommandOptionType, Collection, Role } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, replyAll } from '../../utils/functions';

const args = [{
    key: 'member',
    prompt: 'What member do you want to get the roles from?',
    type: 'member',
    required: false,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class RolesCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'roles',
            group: 'lists',
            description: 'Displays a list of roles in the server, or the roles of a specific member.',
            details: '`member` can be either a member\'s name, mention or ID.',
            format: 'roles <member>',
            examples: ['roles Pixoll'],
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'The member to get the roles from.',
            }],
        });
    }

    public async run(context: CommandContext<true>, { member }: ParsedArgs): Promise<void> {
        const { guild, guildId } = context;

        const guildMember = member ? await guild.members.fetch(member.id).catch(() => null) : null;
        const memberRoles = guildMember?.roles.cache.filter(role => role.id !== guildId);
        const guildRoles = !memberRoles
            ? await guild.roles.fetch().catch(() => null) as Collection<string, Role>
            : null;

        const rolesCache = memberRoles ?? guildRoles?.filter(role => role.id !== guildId);
        if (!rolesCache) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'I couldn\'t find any roles.',
            }));
            return;
        }

        const roles = rolesCache.sort((a, b) => b.position - a.position).map(r => `${r.toString()} ${r.name}`) ?? null;
        if (!roles) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'This member has no roles.',
            }));
            return;
        }

        const name = guildMember?.user.username ?? guild.name;
        const avatar = guildMember?.displayAvatarURL({ forceStatic: false })
            || guild.iconURL({ forceStatic: false });

        await generateEmbed(context, roles, {
            number: 20,
            authorName: `${name} has ${pluralize('role', roles.length)}`,
            authorIconURL: avatar,
            useDescription: true,
        });
    }
}
