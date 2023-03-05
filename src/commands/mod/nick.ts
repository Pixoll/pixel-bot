import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, replyAll } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to change/remove the nick?',
    type: 'user',
}, {
    key: 'nickname',
    prompt: 'What will be their new nickname? Type `remove` to remove their current nickname.',
    type: 'string',
    max: 32,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class NickCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'nick',
            aliases: ['nickname', 'setnick'],
            group: 'mod',
            description: 'Change the nickname of a user or remove it.',
            details: stripIndent`
                \`user\` can be either a user's name, mention or ID.
                \`nick\` will be the user's new nickname.
                Setting \`nick\` as \`remove\` will remove the user's current nickname.
            `,
            format: 'nick [user] [nick]',
            examples: [
                'nick Pixoll Cool coder',
                'nick Pixoll remove',
            ],
            clientPermissions: ['ManageNicknames'],
            userPermissions: ['ManageNicknames'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { user, nickname }: ParsedArgs): Promise<void> {
        const { author, guild } = context;
        const { tag, username } = user;
        const member = await guild.members.fetch(user).catch(() => null);
        if (!member) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }

        if (!member.manageable) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: `Unable to change ${user.toString()}'s nickname`,
                fieldValue: 'Please check the role hierarchy or server ownership.',
            }));
            return;
        }

        const isRemove = nickname.toLowerCase() === 'remove';

        const toApply = isRemove ? username : nickname;
        const wasApplied = await member.setNickname(
            toApply, `${author.tag} changed nickname via "${this.name}" command.`
        ).catch(() => false).then(v => !!v);
        if (!wasApplied) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'An error occurred when trying to change that member\'s nickname. Please try again.',
            }));
            return;
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: isRemove
                ? `Removed \`${tag}\`'s nickname.`
                : `Changed \`${tag}\`'s nickname to \`${nickname}\``,
        }));
    }
}
