"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['view', 'add', 'remove'],
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'rule',
        prompt: 'What rule do you want to add, remove or view?',
        type: ['integer', 'string'],
        min: 1,
        max: 1024,
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            if (subCommand === 'add') {
                return await argument.type?.validate(value, message, pixoll_commando_1.Util.omit(argument, ['min'])) ?? true;
            }
            if (typeof value === 'undefined')
                return false;
            const integerType = message.client.registry.types.get('integer');
            const isValidInteger = await integerType?.validate(value, message, pixoll_commando_1.Util.omit(argument, ['max'])) ?? true;
            if (isValidInteger !== true || !message.inGuild())
                return isValidInteger;
            const rulesData = await message.guild.database.rules.fetch();
            const rule = rulesData?.rules[(+value) - 1];
            if (!rule)
                return `That rule doesn't exist. There are only ${rulesData?.rules.length} rules in this server`;
            return true;
        },
    }];
class RuleCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'rule',
            group: 'managing',
            description: 'Add or remove a rule from the server.',
            format: (0, common_tags_1.stripIndent) `
                rule view [number] - View a single rule.
                rule add [rule] - Add a new rule (server owner only).
                rule remove [number] - Remove a rule (server owner only).
            `,
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'View a single rule.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Integer,
                            name: 'rule',
                            description: 'The number of the rule to view.',
                            required: true,
                            minValue: 1,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'add',
                    description: 'Add a new rule (server owner only).',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'rule',
                            description: 'The rule you want to add.',
                            required: true,
                            maxLength: 1024,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'remove',
                    description: 'Remove a rule (server owner only).',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Integer,
                            name: 'rule',
                            description: 'The number of the rule to remove.',
                            required: true,
                            minValue: 1,
                        }],
                }],
        });
    }
    async run(context, { subCommand, rule }) {
        const rulesData = await context.guild.database.rules.fetch();
        switch (subCommand) {
            case 'view':
                return await this.runView(context, rulesData, +rule);
            case 'add':
                return await this.runAdd(context, rulesData, rule.toString());
            case 'remove':
                return await this.runRemove(context, rulesData, +rule);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context, rulesData, rule) {
        if (!rulesData || rulesData.rules.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server. Add one with the `add` sub-command.',
            }));
            return;
        }
        const { guild } = context;
        const ruleEmbed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${guild.name}'s rules`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .addFields({
            name: `Rule ${rule--}`,
            value: rulesData.rules[rule],
        })
            .setTimestamp();
        await (0, utils_1.replyAll)(context, ruleEmbed);
    }
    /**
     * The `add` sub-command
     */
    async runAdd(context, rulesData, rule) {
        const { guildId, guild, client, author } = context;
        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            await this.onBlock(context, 'guildOwnerOnly');
            return;
        }
        const db = guild.database.rules;
        if (rulesData)
            await db.update(rulesData, { $push: { rules: rule } });
        else
            await db.add({ guild: guildId, rules: [rule] });
        const number = rulesData ? rulesData.rules.length + 1 : 1;
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `The rule has been added under \`Rule ${number}\``,
        }));
    }
    /**
     * The `remove` sub-command
     */
    async runRemove(context, rulesData, rule) {
        if (!rulesData || rulesData.rules.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server.',
            }));
            return;
        }
        const { guild, client, author } = context;
        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            await this.onBlock(context, 'guildOwnerOnly');
            return;
        }
        rule--;
        await guild.database.rules.update(rulesData, { $pull: { rules: rulesData.rules[rule] } });
        rule++;
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Removed rule number ${rule--}:`,
            fieldValue: rulesData.rules[rule],
        }));
    }
}
exports.default = RuleCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy9ydWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RTtBQUN4RSxxREFVeUI7QUFDekIsdUNBQWtFO0FBRWxFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7UUFDaEMsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLCtDQUErQztRQUN2RCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQzNCLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLElBQUk7UUFDVCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsSUFBSSxVQUFVLEtBQUssS0FBSyxFQUFFO2dCQUN0QixPQUFPLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxzQkFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBYSxDQUFDLElBQUksSUFBSSxDQUFDO2FBQzFHO1lBQ0QsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQy9DLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxN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