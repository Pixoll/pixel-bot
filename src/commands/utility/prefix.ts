import { stripIndent } from 'common-tags';
import { ActivityType } from 'discord.js';
import { Command, CommandContext, CommandoClient, DatabaseManager, ParseRawArguments, PrefixSchema } from 'pixoll-commando';
import { basicEmbed } from '../../utils';

const args = [{
    key: 'newPrefix',
    label: 'new prefix',
    prompt: 'What is the new prefix you want to set for the bot?',
    type: 'string',
    required: false,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class PrefixCommand extends Command<boolean, RawArgs> {
    protected readonly globalDb: DatabaseManager<PrefixSchema>;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'prefix',
            group: 'utility',
            description: 'Get or change the prefix of the bot.',
            detailedDescription: stripIndent`
				If \`new prefix\` is not defined, it will send the current prefix.
				Otherwise, it will change the current prefix for \`new prefix\`.
			`,
            format: 'prefix <new prefix>',
            examples: ['prefix ?'],
            guarded: true,
            args,
        });

        this.globalDb = this.client.database.prefixes;
    }

    public async run(context: CommandContext, { newPrefix }: ParsedArgs): Promise<void> {
        if (context.isInteraction()) return;

        const { guild, client, member } = context;
        const current = guild?.prefix || client.prefix;

        if (!newPrefix) {
            const description = guild ? `The bot prefix in this server is \`${current}\``
                : `The global bot prefix is \`${current}\``;

            await context.replyEmbed(basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description,
            }));
            return;
        }

        if (!guild && !client.isOwner(context)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }

        if (guild && !client.isOwner(context) && !member?.permissions.has('Administrator')) {
            await this.onBlock(context, 'userPermissions', { missing: ['Administrator'] });
            return;
        }

        if (current === newPrefix) {
            await context.replyEmbed(basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: `The current prefix is already \`${newPrefix}\``,
            }));
            return;
        }

        if (guild) guild.prefix = newPrefix;
        else client.prefix = newPrefix;

        const targetDb = guild ? guild.database.prefixes : this.globalDb;
        const doc = await targetDb.fetch();

        if (doc && client.prefix === guild?.prefix) {
            await targetDb.delete(doc);
        } else {
            if (doc) {
                await targetDb.update(doc, { prefix: newPrefix });
            } else {
                await targetDb.add({
                    global: !guild,
                    guild: guild?.id,
                    prefix: newPrefix,
                });
            }
        }

        const description = guild ? `Changed the bot prefix of this server to \`${newPrefix}\``
            : `Changed the global bot prefix to \`${newPrefix}\``;

        await context.replyEmbed(basicEmbed({
            color: 'Green',
            emoji: 'check',
            description,
        }));

        if (!guild) {
            client.user.setActivity({
                name: `for ${newPrefix}help`,
                type: ActivityType.Watching,
            });
        }
    }
}
