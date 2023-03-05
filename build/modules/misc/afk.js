"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/** This module manages `!afk`'s timeouts and mentions. */
function default_1(client) {
    client.on('messageCreate', async (message) => {
        const { guild, author } = message;
        const { isCommand, command } = (0, utils_1.parseMessageToCommando)(message) ?? {};
        if (!guild || author.bot || (isCommand && command?.name === 'afk'))
            return;
        const db = guild.database.afk;
        const status = await db.fetch({ user: author.id });
        if (!status)
            return;
        await db.delete(status);
        const toDelete = await message.reply({
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    description: `Welcome back ${author.toString()}, I removed your AFK status.`,
                })],
        });
        await (0, utils_1.sleep)(10);
        await toDelete?.delete().catch(() => null);
    });
    client.on('messageCreate', async (message) => {
        const { guild, author, mentions } = message;
        const { everyone, users } = mentions;
        if (!guild || author.bot || everyone)
            return;
        const db = guild.database.afk;
        const embeds = [];
        for (const user of users.toJSON()) {
            const data = await db.fetch({ user: user.id });
            if (!data)
                continue;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor('Gold')
                .setAuthor({
                name: `${user.username} is AFK`,
                iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
                .setDescription(`${data.status}\n${(0, utils_1.timestamp)(data.updatedAt, 'R')}`)
                .setTimestamp(data.updatedAt);
            embeds.push(embed);
        }
        if (embeds.length === 0)
            return;
        const toDelete = [];
        while (embeds.length > 0) {
            const sliced = embeds.splice(0, 10);
            const msg = await message.reply({ embeds: sliced }).catch(() => null);
            if (msg)
                toDelete.push(msg);
        }
        await (0, utils_1.sleep)(15);
        for (const msg of toDelete) {
            await msg.delete().catch(() => null);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWZrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbWlzYy9hZmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBbUQ7QUFDbkQsdUNBQW1GO0FBR25GLDBEQUEwRDtBQUMxRCxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBQSw4QkFBc0IsRUFBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckUsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLE9BQU8sRUFBRSxJQUFJLEtBQUssS0FBSyxDQUFDO1lBQUUsT0FBTztRQUUzRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBRXBCLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV4QixNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDakMsTUFBTSxFQUFFLENBQUMsSUFBQSxrQkFBVSxFQUFDO29CQUNoQixLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUsZ0JBQWdCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsOEJBQThCO2lCQUMvRSxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUEsYUFBSyxFQUFD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