import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { basicEmbed, replyAll } from '../../utils';

const args = [{
    key: 'user',
    prompt: 'What user do you want to check their ban?',
    type: 'user',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class BanCheckCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'ban-check',
            aliases: ['bancheck', 'checkban'],
            group: 'mod',
            description: 'Check if a user is banned.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'ban-check [user]',
            examples: ['ban-check Pixoll'],
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { user }: ParsedArgs): Promise<void> {
        const { guild } = context;

        const ban = await guild.bans.fetch(user).catch(() => null);
        if (!ban) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: `${user.toString()} is not banned.`,
            }));
            return;
        }

        const reason = ban.reason?.replace(/%20/g, ' ') || 'No reason given.';

        await replyAll(context, basicEmbed({
            color: 'Blue',
            fieldName: `${user.tag} is banned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
