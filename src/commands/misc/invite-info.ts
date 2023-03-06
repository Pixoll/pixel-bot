import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { Command, CommandContext, CommandoClient, ParseRawArguments } from 'pixoll-commando';
import { timestamp, basicEmbed, replyAll } from '../../utils';

const args = [{
    key: 'invite',
    prompt: 'What invite do you want to get information from?',
    type: 'invite',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    inviteUrl?: string;
};

export default class InviteInfoCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'invite-info',
            aliases: ['inviteinfo', 'invinfo'],
            group: 'misc',
            description: 'Displays information about an invite.',
            details: '`invite` may be a link, an invite codes, or a vanity code.',
            format: 'invite-info [invite]',
            examples: [
                'invite-info minecraft',
                'invite-info https://discord.gg/Pc9pAHf3GU',
            ],
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'invite-url',
                description: 'The invite to get info from.',
                required: true,
            }],
        });
    }

    public async run(context: CommandContext, { invite, inviteUrl }: ParsedArgs): Promise<void> {
        if (inviteUrl) {
            const fetchedInvite = await this.client.fetchInvite(inviteUrl).catch(() => null);
            if (!fetchedInvite) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'That invite is invalid.',
                }));
                return;
            }
            invite = fetchedInvite;
        }

        const { guild, channel, url, inviter, presenceCount, memberCount, maxUses, expiresAt, temporary } = invite;

        const info = guild
            ? stripIndent`
            **Channel:** ${channel?.toString()} ${channel?.name}
            **Online members:** ${presenceCount}/${memberCount}
            `
            : `**Members:** ${memberCount}`;

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: (!channel?.isDMBased() ? guild?.name : channel?.name) ?? '',
                iconURL: (!channel?.isDMBased()
                    ? guild?.iconURL({ forceStatic: false })
                    : channel && 'iconURL' in channel && channel?.iconURL()
                ) || '',
                url,
            })
            .setDescription(stripIndent`
                **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                ${info}
                **Max uses:** ${maxUses || 'No limit'}
                **Expires:** ${expiresAt ? timestamp(expiresAt, 'R', true) : 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter({
                text: guild
                    ? `Server ID: ${guild.id}`
                    : `Group DM ID: ${channel?.id}`,
            });

        await replyAll(context, embed);
    }
}
