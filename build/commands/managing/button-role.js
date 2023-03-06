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
                const role = await type.parse(query, message, argument);
                const isValid2 = (0, utils_1.isValidRole)(message, role);
                valid.push(isValid2);
            }
            return valid.filter(b => b === true).length === 0;
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
                \`roles\` to be all the roles' names, mentions or ids, separated by commas (max. ${rolesAmount} at once).
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
                    description: `The ${(0, utils_1.addOrdinalSuffix)(n + 1)} role.`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLXJvbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWFuYWdpbmcvYnV0dG9uLXJvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBUW9CO0FBQ3BCLHFEQVV5QjtBQUN6Qix1Q0FTcUI7QUFFckIsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsU0FBUztRQUNkLE1BQU0sRUFBRSx5REFBeUQ7UUFDakUsSUFBSSxFQUFFLGNBQWM7S0FDdkIsRUFBRTtRQUNDLEdBQUcsRUFBRSxPQUFPO1FBQ1osTUFBTSxFQUFFLHFEQUFxRDtRQUM3RCxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBeUIsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ2xGLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUF5QixDQUFDO1lBQy9FLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEUsTUFBTSxLQUFLLEdBQWMsRUFBRSxDQUFDO1lBQzVCLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUN6QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUE0QixDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxRQUFRO29CQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxF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