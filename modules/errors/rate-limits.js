/* eslint-disable no-unused-vars */
const { oneLine, stripIndent } = require('common-tags');
const { TextChannel, MessageEmbed, RateLimitData } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
const { timestamp } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/**
 * Rate limits manager
 * @param {CommandoClient} client The client instance
 */
module.exports = (client) => {
    client.on('rateLimit', async data => await manager(data));

    client.on('debug', async msg => {
        const isRateLimit = msg.includes('while executing a request');
        if (!isRateLimit) return;

        const data = {
            global: !!msg.match(/Global *: true/)?.map(m => m)[0].split(/ +/).pop(),
            method: msg.match(/Method *: .+/)?.map(m => m)[0].split(/ +/).pop(),
            path: msg.match(/Path *: .*/)?.map(m => m)[0].split(/ +/).pop(),
            route: msg.match(/Route *: .*/)?.map(m => m)[0].split(/ +/).pop(),
            limit: msg.match(/Limit *: .+/)?.map(m => m)[0].split(/ +/).pop(),
            timeout: parseInt(msg.match(/Timeout *: .+/)?.map(m => m)[0].split(/ +/).pop()),
        };

        await manager(data);
    });

    /** @param {RateLimitData} data */
    async function manager(data) {
        const { global, limit, method, path, route, timeout } = data;

        if (global) {
            console.log('rateLimit >', data);

            /** @type {TextChannel} */
            const errorsChannel = await client.channels.fetch('906740370304540702');

            const embed = new MessageEmbed()
                .setColor('GOLD')
                .setTitle('Global rate limit reached')
                .setDescription(oneLine`
                    Reached limit of \`${limit}\`. Timeout ${timestamp(Date.now() + timeout)}.
                `)
                .addField('Information', stripIndent`
                    **Path:** ${path}
                    **Route:** ${route}
                    **Method:** ${method}
                `)
                .setTimestamp();

            await errorsChannel.send({ content: client.owners[0].toString(), embeds: [embed] });
            return;
        }

        const isMessageCooldown = !!route.match(/\/channels\/\d{17,20}\/messages/)?.map(m => m)[0];
        if (isMessageCooldown) return;

        const isTypingCooldown = !!route.match(/\/channels\/\d{17,20}\/typing/)?.map(m => m)[0] && method === 'post';
        if (isTypingCooldown) return;

        console.log('rateLimit >', data);
    }
};
