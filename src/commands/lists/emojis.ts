import { EmbedBuilder, GuildPremiumTier } from 'discord.js';
import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { deepCopy, replyAll } from '../../utils';

function sliceEmojis(emojis: string[]): string[][] {
    const dummy: string[] = [];
    const normal: string[][] = [];
    for (const emoji of emojis) {
        if (dummy.join(' ').length + emoji.length + 1 > 1024) {
            normal.push(deepCopy(dummy));
            dummy.splice(0, dummy.length);
        }
        dummy.push(emoji);
    }
    normal.push(dummy);
    return normal;
}

const maxEmojiAmountMap: Record<GuildPremiumTier, number> = {
    [GuildPremiumTier.None]: 50,
    [GuildPremiumTier.Tier1]: 100,
    [GuildPremiumTier.Tier2]: 150,
    [GuildPremiumTier.Tier3]: 250,
};

export default class EmojisCommand extends Command<true> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'emojis',
            group: 'lists',
            description: 'Displays a list of server emojis.',
            details: 'If the amount of emojis is too big, I will only display the maximum amount I\'m able to.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>): Promise<void> {
        const { guild } = context;
        const emojis = await guild.emojis.fetch();
        const maxEmojis = maxEmojiAmountMap[guild.premiumTier];

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${guild.name}'s emojis`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(`**Total emojis:** ${emojis.size}/${maxEmojis}`);

        const normal = emojis.filter(e => !e.animated).map(e => e.toString());
        const animated = emojis.filter(e => e.animated).map(e => e.toString());

        const normalChunks = sliceEmojis(normal);
        const animatedChunks = sliceEmojis(animated);

        embed.addFields({
            name: `Normal emojis: ${normal.length}/${maxEmojis}`,
            value: normalChunks.shift()?.join(' ') || 'No emojis found.',
        });
        while (normalChunks.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: normalChunks.shift()?.join(' ') ?? '',
            });
        }

        embed.addFields({
            name: `Animated emojis: ${animated.length}/${maxEmojis}`,
            value: animatedChunks.shift()?.join(' ') || 'No emojis found.',
        });
        while (animatedChunks.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: animatedChunks.shift()?.join(' ') ?? '',
            });
        }

        await replyAll(context, embed);
    }
}
