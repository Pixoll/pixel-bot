import { stripIndent } from 'common-tags';
import { Command, CommandContext, CommandoClient, ParseRawArguments, ReadonlyArgumentInfo } from 'pixoll-commando';
import { basicEmbed, reply } from '../../utils';

const args = [{
    key: 'member',
    prompt: 'What member do you want to change/remove the nick?',
    type: 'member',
}, {
    key: 'nickname',
    prompt: 'What will be their new nickname? Type `remove` to remove their current nickname.',
    type: 'string',
    max: 32,
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class NickCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'nick',
            aliases: ['nickname', 'setnick'],
            group: 'mod',
            description: 'Change the nickname of a member or remove it.',
            detailedDescription: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                \`nick\` will be the member's new nickname.
                Setting \`nick\` as \`remove\` will remove the member's current nickname.
            `,
            format: 'nick [member] [nick]',
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

    public async run(context: CommandContext<true>, { member: passedMember, nickname }: ParsedArgs): Promise<void> {
        const { author, guild } = context;
        const member = await guild.members.fetch(passedMember.id).catch(() => null);
        if (!member) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }

        const { tag, username } = member.user;
        if (!member.manageable) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: `Unable to change ${member.toString()}'s nickname`,
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
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'An error occurred when trying to change that member\'s nickname. Please try again.',
            }));
            return;
        }

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: isRemove
                ? `Removed \`${tag}\`'s nickname.`
                : `Changed \`${tag}\`'s nickname to \`${nickname}\``,
        }));
    }
}
