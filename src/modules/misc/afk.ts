import { EmbedBuilder, Message } from 'discord.js';
import { basicEmbed, parseMessageToCommando, sleep, timestamp } from '../../utils';
import { CommandoClient } from 'pixoll-commando';

/** This module manages `!afk`'s timeouts and mentions. */
export default function (client: CommandoClient<true>): void {
    client.on('messageCreate', async message => {
        const { guild, author } = message;
        const { isCommand, command } = parseMessageToCommando(message) ?? {};
        if (!guild || author.bot || (isCommand && command?.name === 'afk')) return;

        const db = guild.database.afk;
        const status = await db.fetch({ user: author.id });
        if (!status) return;

        await db.delete(status);

        const toDelete = await message.reply({
            embeds: [basicEmbed({
                color: 'Green',
                description: `Welcome back ${author.toString()}, I removed your AFK status.`,
            })],
        });

        await sleep(10);
        await toDelete?.delete().catch(() => null);
    });

    client.on('messageCreate', async message => {
        const { guild, author, mentions } = message;
        const { everyone, users } = mentions;
        if (!guild || author.bot || everyone) return;

        const db = guild.database.afk;
        const embeds: EmbedBuilder[] = [];
        for (const user of users.toJSON()) {
            const data = await db.fetch({ user: user.id });
            if (!data) continue;

            const embed = new EmbedBuilder()
                .setColor('Gold')
                .setAuthor({
                    name: `${user.username} is AFK`,
                    iconURL: user.displayAvatarURL({ forceStatic: false }),
                })
                .setDescription(`${data.status}\n${timestamp(data.updatedAt, 'R')}`)
                .setTimestamp(data.updatedAt);
            embeds.push(embed);
        }

        if (embeds.length === 0) return;

        const toDelete: Message[] = [];
        while (embeds.length > 0) {
            const sliced = embeds.splice(0, 10);
            const msg = await message.reply({ embeds: sliced }).catch(() => null);
            if (msg) toDelete.push(msg);
        }

        await sleep(15);
        for (const msg of toDelete) {
            await msg.delete().catch(() => null);
        }
    });
}
