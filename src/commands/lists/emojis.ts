import { EmbedBuilder, GuildPremiumTier } from 'discord.js';
import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { replyAll } from '../../utils';

function sliceEmojis(arr: string[]): string[][] {
    const dummy = [];
    const normal = [];
    for (const emoji of arr) {
        if (dummy.join(' ').length + emoji.length + 1 > 1024) {
            normal.push(dummy);
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
        const rawEmojis = await guild.emojis.fetch();
        const maxEmojis = maxEmojiAmountMap[guild.premiumTier];

        const emojis = rawEmojis.map(emoji => ({
            animated: emoji.animated,
            string: emoji.toString(),
        }));

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${guild.name}'s emojis`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            });

        const notAnimated = emojis.filter(e => !e.animated).map(e => e.string);
        const isAnimated = emojis.filter(e => e.animated).map(e => e.string);

        const normal = sliceEmojis(notAnimated);
        const animated = sliceEmojis(isAnimated);

        embed.addFields({
            name: `Normal emojis: ${notAnimated.length}/${maxEmojis}`,
            value: normal.shift()?.join(' ') || 'No emojis found.',
        });
        while (normal.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: normal.shift()?.join(' ') ?? '',
            });
        }

        embed.addFields({
            name: `Animated emojis: ${isAnimated.length}/${maxEmojis}`,
            value: animated.shift()?.join(' ') || 'No emojis found.',
        });
        while (animated.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: animated.shift()?.join(' ') ?? '',
            });
        }

        await replyAll(context, embed);
    }
}
