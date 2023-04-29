"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const modulesInfo = require('../../../documents/modules.json');
const modules = [];
const auditLogs = [];
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['diagnose', 'toggle', 'info'],
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'module',
        prompt: 'What module do you want to toggle/diagnose?',
        type: 'string',
        oneOf: modules,
    }, {
        key: 'subModule',
        label: 'sub-module',
        prompt: 'What sub-module of the audit logs do you want to toggle/diagnose?',
        type: 'string',
        oneOf: auditLogs,
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            if (subCommand === 'info')
                return true;
            const moduleName = getModuleName(message);
            return moduleName !== 'audit-logs';
        },
    }];
function getModuleName(message) {
    return pixoll_commando_1.CommandoMessage.parseArgs(message.content)[2];
}
function parseModuleData(data) {
    return Object.fromEntries(Object.entries(pixoll_commando_1.Util.omit(data, [
        '_id', 'guild',
    ])).map(([key, value]) => {
        if (typeof value === 'boolean')
            return [key, (0, utils_1.isTrue)(value)];
        return [key, Object.fromEntries(Object.entries(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            value ?? {}).map(([nestedKey, nestedValue]) => [nestedKey, (0, utils_1.isTrue)(nestedValue)]))];
    }));
}
class ModuleCommand extends pixoll_commando_1.Command {
    constructor(client) {
        const modulesObj = pixoll_commando_1.Util.omit(client.databaseSchemas.ModulesModel.schema.obj, [
            '__v', '_id', 'guild',
        ]);
        modules.push(...Object.keys(modulesObj).map(utils_1.camelToKebabCase));
        auditLogs.push(...Object.keys(modulesObj.auditLogs).map(utils_1.camelToKebabCase));
        const moduleChoices = modules.map(m => ({
            name: pixoll_commando_1.Util.capitalize(m.replace('-', ' ')),
            value: m,
        }));
        const submoduleChoices = auditLogs.map(m => ({
            name: pixoll_commando_1.Util.capitalize(m.replace('-', ' ')),
            value: m,
        }));
        const generateSubcommandOptions = (action) => [{
                type: discord_js_1.ApplicationCommandOptionType.String,
                name: 'module',
                description: `The module to ${action}.`,
                required: true,
                choices: moduleChoices,
            }, {
                type: discord_js_1.ApplicationCommandOptionType.String,
                name: 'sub-module',
                description: `The sub-module to ${action}. Only usable if "module" is "Audit Logs".`,
                choices: submoduleChoices,
            }];
        super(client, {
            name: 'module',
            group: 'utility',
            description: 'Diagnose the status of a module or sub-module, or toggle it on/off.',
            detailedDescription: (0, common_tags_1.stripIndent) `
            \`module\` can be either: ${modules.map(m => `\`${m}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            \`sub-module\` can be either: ${auditLogs.map(sm => `\`${sm}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            `,
            format: (0, common_tags_1.stripIndent) `
            module info [module] - Get detailed information about a module.
            module diagnose [module] <sub-module> - Diagnose a module or sub-module.
            module toggle [module] <sub-module> - Toggle a module or sub-module on/off.
            `,
            examples: [
                'module info sticky-roles',
                'module diagnose welcome',
                'module toggle audit-logs channels',
            ],
            userPermissions: ['Administrator'],
            guarded: true,
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'diagnose',
                    description: 'Diagnose a module or sub-module.',
                    options: generateSubcommandOptions('diagnose'),
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'toggle',
                    description: 'Toggle a module or sub-module on/off.',
                    options: generateSubcommandOptions('toggle'),
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'info',
                    description: 'Get detailed information from a module.',
                    options: generateSubcommandOptions('get information from').slice(0, 1),
                }],
        });
    }
    async run(context, { subCommand, module: moduleName, subModule }) {
        const lcModule = moduleName.toLowerCase();
        const lcSubModule = moduleName === 'audit-logs' ? subModule?.toLowerCase() ?? null : null;
        switch (subCommand) {
            case 'info':
                return await this.runInfo(context, lcModule);
            case 'diagnose':
                return await this.runDiagnose(context, lcModule, lcSubModule);
            case 'toggle':
                return await this.runToggle(context, lcModule, lcSubModule);
        }
    }
    async runInfo(context, moduleName) {
        const { client } = context;
        const rawModuleName = pixoll_commando_1.Util.kebabToCamelCase(moduleName);
        const moduleInfo = modulesInfo[rawModuleName];
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${client.user.username}'s modules`,
            iconURL: client.user.displayAvatarURL(),
        })
            .setTitle(`Module: ${pixoll_commando_1.Util.capitalize(moduleName.replace(/-/g, ' '))}`)
            .setFields(moduleInfo)
            .setTimestamp();
        await (0, utils_1.reply)(context, embed);
    }
    /**
     * The `diagnose` sub-command
     */
    async runDiagnose(context, moduleName, subModule) {
        const { guild } = context;
        const data = await guild.database.modules.fetch();
        if (!data) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }
        const parsedData = parseModuleData(data);
        const rawModuleName = pixoll_commando_1.Util.kebabToCamelCase(moduleName);
        const rawSubModuleName = subModule ? pixoll_commando_1.Util.kebabToCamelCase(subModule) : null;
        let isTopLevelModuleEnabled = parsedData[rawModuleName];
        if (typeof isTopLevelModuleEnabled === 'object') {
            const full = Object.values(isTopLevelModuleEnabled);
            const part = full.filter(b => b === false);
            isTopLevelModuleEnabled = full.length !== part.length;
        }
        const isEnabled = rawModuleName === 'auditLogs' && rawSubModuleName
            ? parsedData[rawModuleName][rawSubModuleName]
            : isTopLevelModuleEnabled;
        const type = subModule ? 'sub-module' : 'module';
        const moduleStatus = isTopLevelModuleEnabled ? 'Enabled' : 'Disabled';
        const diagnose = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `Status of ${type}: ${subModule || moduleName}`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Status:** ${isEnabled ? 'Enabled' : 'Disabled'}
                ${subModule ? `**Parent module:** ${pixoll_commando_1.Util.capitalize(moduleName)}` : ''}
                ${subModule ? `**Parent module status:** ${moduleStatus}` : ''}
            `)
            .setTimestamp();
        await (0, utils_1.reply)(context, diagnose);
    }
    /**
     * The `toggle` sub-command
     */
    async runToggle(context, moduleName, subModule) {
        const { guildId, guild } = context;
        const db = guild.database.modules;
        const data = await db.fetch();
        if (!data) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }
        const rawModuleName = pixoll_commando_1.Util.kebabToCamelCase(moduleName);
        const rawSubModuleName = subModule ? pixoll_commando_1.Util.kebabToCamelCase(subModule) : null;
        const newDocument = {
            guild: guildId,
            ...parseModuleData(data),
        };
        if (!rawSubModuleName && rawModuleName !== 'auditLogs') {
            newDocument[rawModuleName] = !newDocument[rawModuleName];
        }
        else if (rawSubModuleName && rawModuleName === 'auditLogs') {
            newDocument[rawModuleName][rawSubModuleName] = !newDocument[rawModuleName][rawSubModuleName];
        }
        await db.update(data, newDocument);
        const type = subModule ? 'sub-module' : 'module';
        const target = subModule ? `${moduleName}/${subModule}` : moduleName;
        const status = rawModuleName === 'auditLogs'
            ? rawSubModuleName && newDocument[rawModuleName][rawSubModuleName]
            : newDocument[rawModuleName];
        this.client.emit('moduleStatusChange', guild, target, status ?? false);
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the ${type} \`${target}\``,
            fieldValue: `**New status:** ${status ? 'Enabled' : 'Disabled'}`,
        }));
    }
}
exports.default = ModuleCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEySDtBQUMzSCxxREFheUI7QUFFekIsdUNBQXFHO0FBTXJHLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBYyxpQ0FBaUMsQ0FBQyxDQUFDO0FBRTVFLE1BQU0sT0FBTyxHQUFrQixFQUFFLENBQUM7QUFDbEMsTUFBTSxTQUFTLEdBQW9CLEVBQUUsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO1FBQ3JDLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSw2Q0FBNkM7UUFDckQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsT0FBTztLQUNqQixFQUFFO1FBQ0MsR0FBRyxFQUFFLFdBQVc7UUFDaEIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsTUFBTSxFQUFFLG1FQUFtRTtRQUMzRSxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxTQUFTO1FBQ2hCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsSUFBSSxVQUFVLEtBQUssTUFBTTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUN2QyxNQUFNLFVBQVUsR0FBRyxh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