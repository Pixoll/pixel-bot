import { Command, CommandContext, CommandoClient, CommandoGuild } from 'pixoll-commando';
import { ChannelType, EmbedBuilder, GuildPremiumTier } from 'discord.js';
import { stripIndent } from 'common-tags';
import { replyAll } from '../../utils/functions';

const boostLevelMap: Record<GuildPremiumTier, string> = {
    [GuildPremiumTier.None]: '0<:boostLVL0:806554204323184692>',
    [GuildPremiumTier.Tier1]: '1<:boostLVL1:806554216641331221>',
    [GuildPremiumTier.Tier2]: '2<:boostLVL2:806554227815481364>',
    [GuildPremiumTier.Tier3]: '3<:boostLVL3:806554239567527946>',
};

export default class ServerInfoCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'server-info',
            aliases: ['serverinfo'],
            group: 'misc',
            description: 'Displays some information and statistics of the server, such as owner, boosts and member count.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const serverInfo = await getServerInfo(context.guild);
        await replyAll(context, serverInfo);
    }
}

export async function getServerInfo(guild: CommandoGuild): Promise<EmbedBuilder> {
    const { name, channels, premiumTier, premiumSubscriptionCount, memberCount, roles, id, createdTimestamp } = guild;
    const owner = await guild.fetchOwner();

    const allChannels = channels.cache;
    const categories = allChannels.filter(c => c.type === ChannelType.GuildCategory).size;
    const text = allChannels.filter(c => c.type === ChannelType.GuildText).size;
    const voice = allChannels.filter(c => c.type === ChannelType.GuildVoice).size;

    const allRoles = await roles.fetch();

    const serverInfo = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({
            name: name,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
        .setThumbnail(guild.iconURL({ forceStatic: false, size: 2048 }))
        .addFields({
            name: 'Information',
            value: stripIndent`
            **Owner:** ${owner.user.tag} <a:owner_crown:806558872440930425>
            **Channel categories:** ${categories.toLocaleString()}
            **Text channels:** ${text.toLocaleString()}
            **Voice channels:** ${voice.toLocaleString()}
            `,
            inline: true,
        }, {
            name: '\u200B',
            value: stripIndent`
            **Server boost lvl:** ${boostLevelMap[premiumTier]}
            **Server boosts:** ${premiumSubscriptionCount?.toLocaleString() ?? 0} <a:boost:806364586231595028>
            **Members:** ${memberCount.toLocaleString()}
            **Roles:** ${allRoles.size.toLocaleString()}
            `,
            inline: true,
        })
        .setFooter({ text: `Server ID: ${id} • Created at` })
        .setTimestamp(createdTimestamp);
    
    return serverInfo;
}
