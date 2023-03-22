"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to get the infractions from?',
        type: 'user',
    }];
class InfractionsCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'infractions',
            group: 'mod-logs',
            description: 'Displays a list of infractions of a user.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'infractions [user]',
            examples: ['infractions Pixoll'],
            modPermissions: true,
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
            contextMenuCommandTypes: [discord_js_1.ApplicationCommandType.User],
        });
    }
    async run(context, { user }) {
        await runCommand(context, user);
    }
    async runUserContextMenu(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await runCommand(interaction, interaction.targetUser);
    }
}
exports.default = InfractionsCommand;
async function runCommand(context, user) {
    const { guild } = context;
    if (!guild)
        return;
    const db = guild.database.moderations;
    const mods = await db.fetchMany({ userId: user.id });
    if (mods.size === 0) {
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Blue',
            emoji: 'info',
            description: 'That user has no infractions.',
        }));
        return;
    }
    const message = 'isMessage' in context && context.isMessage() ? context : await context.fetchReply();
    const filterMenu = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`${message.id}:menu`)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder('Filter...')
        .setOptions([
        { label: 'All', value: 'all', emoji: '🎲' },
        { label: 'Bans', value: 'ban', emoji: '822644311140204554' },
        { label: 'Soft bans', value: 'soft-ban', emoji: '🔨' },
        { label: 'Temp bans', value: 'temp-ban', emoji: '⏲' },
        { label: 'Kicks', value: 'kick', emoji: '🥾' },
        { label: 'Mutes', value: 'mute', emoji: '🔇' },
        { label: 'Warns', value: 'warn', emoji: '⚠' },
    ]));
    await (0, utils_1.generateEmbed)(context, mods.toJSON(), {
        authorName: `${user.username} has ${(0, utils_1.pluralize)('infraction', mods.size)}`,
        authorIconURL: user.displayAvatarURL({ forceStatic: false }),
        title: ' •  ID:',
        keyTitle: { prefix: 'type' },
        keysExclude: ['updatedAt', 'guild', 'userId', 'userTag'],
        useDocId: true,
        components: [filterMenu],
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kLWxvZ3MvaW5mcmFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBcUc7QUFDckcscURBTXlCO0FBQ3pCLHVDQUEwRTtBQUUxRSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsb0RBQW9EO1FBQzVELElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBVSxDQUFDO0FBS1osTUFBcUIsa0JBQW1CLFNBQVEseUJBQXNCO0lBQ2xFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsMkNBQTJDO1lBQ3hELG1CQUFtQixFQUFFLHFEQUFxRDtZQUMxRSxNQUFNLEVBQUUsb0JBQW9CO1lBQzVCLFFBQVEsRUFBRSxDQUFDLG9CQUFvQixDQUFDO1lBQ2hDLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7WUFDOUIsdUJBQXVCLEVBQUUsQ0FBQyxtQ0FBc0IsQ0FBQyxJQUFJLENBQUM7U0FDekQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBYztRQUNoRSxNQUFNLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxXQUFzRDtRQUNsRixNQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsRCxNQUFNLFVBQVUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FB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