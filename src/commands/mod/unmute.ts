import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, confirmButtons, reply } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to unmute?',
    type: 'user',
}, {
    key: 'reason',
    prompt: 'What is the reason of the unmute?',
    type: 'string',
    max: 512,
    default: 'No reason given.',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class UnmuteCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'unmute',
            group: 'mod',
            description: 'Unmute a user.',
            detailedDescription: stripIndent`
                \`user\` can be either a user's name, mention or ID.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'unmute [user] <reason>',
            examples: [
                'unmute Pixoll',
                'unmute Pixoll Appealed',
            ],
            clientPermissions: ['ManageRoles'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { user, reason }: ParsedArgs): Promise<void> {
        const { guild, author } = context;
        const { active, setup } = guild.database;
        const member = await guild.members.fetch(user).catch(() => null);
        if (!member) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        reason ??= 'No reason given.';

        const data = await setup.fetch();
        if (!data || !data.mutedRole) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.',
            }));
            return;
        }

        const { roles } = member;
        const role = await guild.roles.fetch(data.mutedRole);

        if (!role || !roles.cache.has(role.id)) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not muted.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'unmute',
            target: user,
            reason,
        });
        if (!confirmed) return;

        await roles.remove(role);
        this.client.emit('guildMemberUnmute', guild, author, user, reason);

        const mute = await active.fetch({ type: 'mute', userId: user.id });
        if (mute) await active.delete(mute);

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.toString()} has been unmuted`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
