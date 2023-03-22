import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { isModerator, generateEmbed, basicEmbed, pluralize, reply } from '../../utils';

export default class ModeratorsCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'moderators',
            aliases: ['mods'],
            group: 'lists',
            description: 'Displays a list of all moderators of this server with their mod roles.',
            detailedDescription: 'Use the `admins` command for a list of the server\'s admins',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;

        const members = guild.members.cache;
        const mods = members.filter(member => isModerator(member, true) && !member.user.bot);
        if (mods.size === 0) {
            await reply(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no moderators, try running the `administrators` command instead.',
            }));
            return;
        }

        const modsList = mods.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(member => ({
                tag: member.user.tag,
                list: member.roles.cache.filter(m => isModerator(m, true)).sort((a, b) => b.position - a.position)
                    .map(r => r.name).join(', ') || 'None',
            }));

        await generateEmbed(context, modsList, {
            authorName: `There's ${pluralize('moderator', modsList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'tag' },
        });
    }
}
