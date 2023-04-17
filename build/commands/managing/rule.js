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
                            autocomplete: true,
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server. Add one with the `add` sub-command.',
            }));
            return;
        }
        const { guild } = context;
        const ruleEmbed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${guild.name}'s rules`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .addFields({
            name: `Rule ${rule--}`,
            value: rulesData.rules[rule],
        })
            .setTimestamp();
        await (0, utils_1.reply)(context, ruleEmbed);
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Removed rule number ${rule--}:`,
            fieldValue: rulesData.rules[rule],
        }));
    }
    async runAutocomplete(interaction) {
        const { guild, options } = interaction;
        if (!guild)
            return;
        const query = options.getFocused().toLowerCase();
        const rulesData = await guild.database.rules.fetch();
        const possibleItems = rulesData?.rules
            .filter(rule => rule.toLowerCase().includes(query))
            .slice(0, 25)
            .map((rule, i) => ({
            name: (0, utils_1.limitStringLength)(`${i + 1}. ${rule}`, 100),
            value: i + 1,
        })) ?? [];
        await interaction.respond(possibleItems);
    }
}
exports.default = RuleCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy9ydWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwSDtBQUMxSCxxREFXeUI7QUFDekIsdUNBQThGO0FBRTlGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7UUFDaEMsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLCtDQUErQztRQUN2RCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQzNCLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLElBQUk7UUFDVCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsSUFBSSxVQUFVLEtBQUssS0FBSyxFQUFFO2dCQUN0QixPQUFPLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxzQkFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBYSxDQUFDLElBQUksSUFBSSxDQUFDO2FBQzFHO1lBQ0QsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQy9DLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxN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