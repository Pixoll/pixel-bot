"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const rolesAmount = 10;
const args = [{
        key: 'channel',
        prompt: 'On what channel do you want to create the button roles?',
        type: 'text-channel',
    }, {
        key: 'roles',
        prompt: 'What roles do you want to set for the button roles?',
        type: 'string',
        async validate(value, message, argument) {
            const type = message.client.registry.types.get('role');
            const queries = value?.split(/\s*,\s*/).slice(0, rolesAmount) ?? [];
            const valid = [];
            for (const query of queries) {
                const isValid1 = await type.validate(query, message, argument);
                if (!isValid1)
                    valid.push(false);
                const isValid2 = (0, utils_1.isValidRole)(message, await type.parse(query, message, argument));
                valid.push(isValid2);
            }
            return valid.filter(b => b !== true).length !== queries.length;
        },
        error: 'None of the roles you specified were valid. Please try again.',
    }];
class ButtonRoleCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'button-role',
            aliases: ['brole', 'buttonrole'],
            group: 'managing',
            description: 'Create or remove button roles.',
            details: (0, common_tags_1.stripIndent) `
                \`channel\` can be either a channel's name, mention or ID.
                \`roles\` to be all the roles' names, mentions or ids, separated by commas (max. 10 at once).
            `,
            format: 'buttonrole [channel] [roles]',
            examples: ['buttonrole #roles Giveaways, Polls'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    channelTypes: [discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement],
                    name: 'channel',
                    description: 'On what channel do you want to create the button roles?',
                    required: true,
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'message',
                    description: 'What message should I send with the buttons?',
                    required: true,
                }, ...(0, utils_1.arrayWithLength)(rolesAmount, (n) => ({
                    type: discord_js_1.ApplicationCommandOptionType.Role,
                    name: `role-${n + 1}`,
                    description: `The ${(0, utils_1.addOrdinalSuffix)(n)} role.`,
                    required: n === 0,
                }))],
        });
    }
    async run(context, args) {
        const { channel } = args;
        let content = args.message || '';
        const message = context.isMessage() ? context : await context.fetchReply();
        const roles = await parseRoles(context, args, message, this);
        const { id } = message;
        if (context.isMessage()) {
            const msg = await (0, utils_1.basicCollector)(context, {
                fieldName: 'What message should I send with the buttons?',
            }, { time: 2 * 60000 });
            if (!msg)
                return;
            content = msg.content;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setDescription(content);
        const buttons = [];
        for (const role of roles) {
            const style = buttons.length >= 5 ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary;
            const button = new discord_js_1.ButtonBuilder()
                .setCustomId(`button-role:${id}:${role.id}`)
                .setLabel(role.name)
                .setStyle(style);
            buttons.push(button);
        }
        const rows = [];
        while (buttons.length > 0) {
            const toAdd = rows.length === 1 ? buttons.splice(0, buttons.length).map(b => b.setStyle(discord_js_1.ButtonStyle.Secondary))
                : buttons.splice(0, buttons.length <= 4 ? 4 : Math.round(buttons.length / 2 + 0.1))
                    .map(b => b.setStyle(discord_js_1.ButtonStyle.Primary));
            const row = new discord_js_1.ActionRowBuilder().addComponents(...toAdd);
            rows.push(row);
        }
        const { url } = await channel.send({ embeds: [embed], components: rows });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `The buttons roles were successfully created ${(0, utils_1.hyperlink)('here', url)}.`,
        }));
    }
}
exports.default = ButtonRoleCommand;
async function parseRoles(context, args, message, command) {
    if (context.isInteraction())
        return Object.entries(args)
            .filter((entry) => entry[0].startsWith('role-'))
            .map(([, role]) => role);
    const results = await Promise.all(args.roles.split(/ +/).map(query => (0, utils_1.parseArgInput)(query, message, command.argsCollector?.args[1], 'role')));
    return pixoll_commando_1.Util.filterNullishItems(results);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXJvbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWFuYWdpbmcvYnV0dG9uLXJvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBUW9CO0FBQ3BCLHFEQVV5QjtBQUN6Qix1Q0FTcUI7QUFFckIsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsU0FBUztRQUNkLE1BQU0sRUFBRSx5REFBeUQ7UUFDakUsSUFBSSxFQUFFLGNBQWM7S0FDdkIsRUFBRTtRQUNDLEdBQUcsRUFBRSxPQUFPO1FBQ1osTUFBTSxFQUFFLHFEQUFxRDtRQUM3RCxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBeUIsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ2xGLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUF5QixDQUFDO1lBQy9FLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEUsTUFBTSxLQUFLLEdBQWMsRUFBRSxDQUFDO1lBQzVCLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUN6QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUE0QixDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxRQUFRO29CQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sUUFBUSxHQUFHLElBQUEsbUJBQVcsRUFBQyxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUMs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