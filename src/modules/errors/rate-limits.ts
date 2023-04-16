import { oneLine, stripIndent } from 'common-tags';
import { TextChannel, EmbedBuilder, RateLimitData } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { timestamp } from '../../utils';

const errorLogsChannelId = '906740370304540702';

/** Rate limits manager */
export default function (client: CommandoClient<true>): void {
    // client.on('rateLimited', data => rateLimitHandler(client, data));

    client.on('debug', async msg => {
        const isRateLimit = msg.includes('while executing a request');
        if (!isRateLimit) return;

        const data: Partial<RateLimitData> = {
            global: !!msg.match(/Global *: true/)?.map(m => m)[0].split(/ +/).pop(),
            method: msg.match(/Method *: .+/)?.map(m => m)[0].split(/ +/).pop() ?? '',
            url: msg.match(/Path *: .*/)?.map(m => m)[0].split(/ +/).pop() ?? '',
            route: msg.match(/Route *: .*/)?.map(m => m)[0].split(/ +/).pop() ?? '',
            limit: +(msg.match(/Limit *: .+/)?.map(m => m)[0].split(/ +/).pop() ?? '0'),
            timeToReset: parseInt(msg.match(/Timeout *: .+/)?.map(m => m)[0].split(/ +/).pop() ?? '0'),
        };

        await rateLimitHandler(client, data);
    });
}

async function rateLimitHandler(client: CommandoClient<true>, data: Partial<RateLimitData>): Promise<void> {
    const { global, limit, method, url, route, timeToReset = 0 } = data;

    if (!global) {

        const isMessageCooldown = !!route?.match(/\/channels\/\d{17,20}\/messages/)?.map(m => m)[0];
        if (isMessageCooldown) return;

        const isTypingCooldown = !!route?.match(/\/channels\/\d{17,20}\/typing/)?.map(m => m)[0] && method === 'post';
        if (isTypingCooldown) return;

        console.log('rateLimit >', data);
        return;
    }

    console.log('rateLimit >', data);

    const errorsChannel = await client.channels.fetch(errorLogsChannelId) as unknown as TextChannel;

    const embed = new EmbedBuilder()
        .setColor('Gold')
        .setTitle('Global rate limit reached')
        .setDescription(oneLine`
            Reached limit of \`${limit}\`. Timeout ${timestamp(Date.now() + timeToReset)}.
        `)
        .addFields({
            name: 'Information',
            value: stripIndent`
            **Path:** ${url}
            **Route:** ${route}
            **Method:** ${method}
            `,
        })
        .setTimestamp();

    await errorsChannel.send({ content: client.owners?.[0].toString(), embeds: [embed] });
}
