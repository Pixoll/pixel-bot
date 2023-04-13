"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const errorLogsChannelId = '906740370304540702';
/** Rate limits manager */
function default_1(client) {
    // client.on('rateLimited', data => rateLimitHandler(client, data));
    client.on('debug', async (msg) => {
        const isRateLimit = msg.includes('while executing a request');
        if (!isRateLimit)
            return;
        const data = {
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
exports.default = default_1;
async function rateLimitHandler(client, data) {
    const { global, limit, method, url, route, timeToReset = 0 } = data;
    if (!global) {
        const isMessageCooldown = !!route?.match(/\/channels\/\d{17,20}\/messages/)?.map(m => m)[0];
        if (isMessageCooldown)
            return;
        const isTypingCooldown = !!route?.match(/\/channels\/\d{17,20}\/typing/)?.map(m => m)[0] && method === 'post';
        if (isTypingCooldown)
            return;
        console.log('rateLimit >', data);
        return;
    }
    console.log('rateLimit >', data);
    const errorsChannel = await client.channels.fetch(errorLogsChannelId);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor('Gold')
        .setTitle('Global rate limit reached')
        .setDescription((0, common_tags_1.oneLine) `
            Reached limit of \`${limit}\`. Timeout ${(0, utils_1.timestamp)(Date.now() + timeToReset)}.
        `)
        .addFields({
        name: 'Information',
        value: (0, common_tags_1.stripIndent) `
            **Path:** ${url}
            **Route:** ${route}
            **Method:** ${method}
            `,
    })
        .setTimestamp();
    await errorsChannel.send({ content: client.owners?.[0].toString(), embeds: [embed] });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF0ZS1saW1pdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9lcnJvcnMvcmF0ZS1saW1pdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXNFO0FBRXRFLHVDQUF3QztBQUV4QyxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0FBRWhELDBCQUEwQjtBQUMxQixtQkFBeUIsTUFBNEI7SUFDakQsb0VBQW9FO0lBRXBFLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxHQUFHLEVBQUMsRUFBRTtRQUMzQixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLFdBQVc7WUFBRSxPQUFPO1FBRXpCLE1BQU0sSUFBSSxHQUEyQjtZQUNqQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFO1lBQ3ZFLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1lBQ3pFLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1lBQ3BF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