import { stripIndent } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { CommandoClient, CommandoGuildManager, Util } from 'pixoll-commando';
import { isGuildModuleEnabled, compareArrays, customEmoji, hyperlink, userFlagToEmojiMap } from '../../utils';

/**
 * Returns a clickable link to the image. `None` if the link is invalid
 * @param link The link of the image
 */
function imageLink(link: string | null): string {
    if (link) return hyperlink('Click here', link);
    return 'None';
}

/** Handles all of the member logs. */
export default function (client: CommandoClient<true>): void {
    client.on('userUpdate', async (oldUser, newUser) => {
        const { username: name1, discriminator: discrim1, avatar: avatar1, flags: flags1 } = oldUser;
        const { username: name2, discriminator: discrim2, avatar: avatar2, flags: flags2, id, tag } = newUser;
        const userType = newUser.bot ? 'bot' : 'user';

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: `Updated ${userType}`,
                iconURL: newUser.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(`${newUser.toString()} ${tag}`)
            .setFooter({ text: `${Util.capitalize(userType)} ID: ${id}` })
            .setTimestamp();

        if (name1 !== name2) embed.addFields({
            name: 'Username',
            value: `${name1} ➜ ${name2}`,
        });

        if (discrim1 !== discrim2) embed.addFields({
            name: 'Discriminator',
            value: `${discrim1} ➜ ${discrim2}`,
        });

        if (avatar1 !== avatar2) embed.addFields({
            name: 'Avatar',
            value: stripIndent`
            **Before:** ${imageLink(oldUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            **After:** ${imageLink(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }))}
            `,
        }).setThumbnail(newUser.displayAvatarURL({ forceStatic: false, size: 2048 }));

        if (flags1 !== flags2) {
            const array1 = Util.filterNullishItems(flags1?.toArray().map(flag => userFlagToEmojiMap[flag]) || []);
            const array2 = Util.filterNullishItems(flags2?.toArray().map(flag => userFlagToEmojiMap[flag]) || []);
            const [added, removed] = compareArrays(array1, array2).map(arr => arr.filter(e => e));

            if (added.length !== 0) embed.addFields({
                name: `${customEmoji('check')} Added badges`,
                value: added.join(', '),
            });
            if (removed.length !== 0) embed.addFields({
                name: `${customEmoji('cross')} Removed badges`,
                value: removed.join(', '),
            });
        }

        if (embed.data.fields?.length === 0) return;

        const guilds = (client.guilds as unknown as CommandoGuildManager).cache.toJSON();
        for (const guild of guilds) {
            const member = guild.members.cache.get(id);
            if (!member) continue;

            const status = await isGuildModuleEnabled(guild, 'audit-logs', 'users');
            if (!status) continue;

            guild.queuedLogs.push(embed);
        }
    });
}
