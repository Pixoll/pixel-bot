"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
/** This module manages `!afk`'s timeouts and mentions. */
function default_1(client) {
    client.on('messageCreate', async (message) => {
        const { guild, author } = message;
        const { isCommand, command } = (0, functions_1.parseMessageToCommando)(message) ?? {};
        if (!guild || author.bot || (isCommand && command?.name === 'afk'))
            return;
        const db = guild.database.afk;
        const status = await db.fetch({ user: author.id });
        if (!status)
            return;
        await db.delete(status);
        const toDelete = await message.reply({
            embeds: [(0, functions_1.basicEmbed)({
                    color: 'Green',
                    description: `Welcome back ${author.toString()}, I removed your AFK status.`,
                })],
        });
        await (0, functions_1.sleep)(10);
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
                .setDescription(`${data.status}\n${(0, functions_1.timestamp)(data.updatedAt, 'R')}`)
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
        await (0, functions_1.sleep)(15);
        for (const msg of toDelete) {
            await msg.delete().catch(() => null);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWZrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbWlzYy9hZmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBbUQ7QUFDbkQscURBQTZGO0FBRzdGLDBEQUEwRDtBQUMxRCxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBQSxrQ0FBc0IsRUFBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckUsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLE9BQU8sRUFBRSxJQUFJLEtBQUssS0FBSyxDQUFDO1lBQUUsT0FBTztRQUUzRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBRXBCLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV4QixNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDakMsTUFBTSxFQUFFLENBQUMsSUFBQSxzQkFBVSxFQUFDO29CQUNoQixLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUsZ0JBQWdCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsOEJBQThCO2lCQUMvRSxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUEsaUJBQUssRUFB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