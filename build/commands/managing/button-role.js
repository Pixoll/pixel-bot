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