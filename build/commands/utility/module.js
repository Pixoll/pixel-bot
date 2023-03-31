"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
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
        modules.push(...Object.keys(modulesObj).map(id => (0, utils_1.addDashes)(id)));
        auditLogs.push(...Object.keys(modulesObj.auditLogs).map(id => (0, utils_1.addDashes)(id)));
        const moduleChoices = modules.map(m => ({
            name: (0, lodash_1.capitalize)(m.replace('-', ' ')),
            value: m,
        }));
        const submoduleChoices = auditLogs.map(m => ({
            name: (0, lodash_1.capitalize)(m.replace('-', ' ')),
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
        const rawModuleName = (0, utils_1.removeDashes)(moduleName);
        const moduleInfo = modulesInfo[rawModuleName];
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${client.user.username}'s modules`,
            iconURL: client.user.displayAvatarURL(),
        })
            .setTitle(`Module: ${(0, lodash_1.capitalize)(moduleName.replace(/-/g, ' '))}`)
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
        const rawModuleName = (0, utils_1.removeDashes)(moduleName);
        const rawSubModuleName = subModule ? (0, utils_1.removeDashes)(subModule) : null;
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
                ${subModule ? `**Parent module:** ${(0, lodash_1.capitalize)(moduleName)}` : ''}
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
        const rawModuleName = (0, utils_1.removeDashes)(moduleName);
        const rawSubModuleName = subModule ? (0, utils_1.removeDashes)(subModule) : null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEySDtBQUMzSCxtQ0FBb0M7QUFDcEMscURBYXlCO0FBRXpCLHVDQUE0RztBQU01RyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQWMsaUNBQWlDLENBQUMsQ0FBQztBQUU1RSxNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO0FBQ2xDLE1BQU0sU0FBUyxHQUFvQixFQUFFLENBQUM7QUFFdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQztRQUNyQyxLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsNkNBQTZDO1FBQ3JELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE9BQU87S0FDakIsRUFBRTtRQUNDLEdBQUcsRUFBRSxXQUFXO1FBQ2hCLEtBQUssRUFBRSxZQUFZO1FBQ25CLE1BQU0sRUFBRSxtRUFBbUU7UUFDM0UsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsU0FBUztRQUNoQixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxDQUFVLEVBQUUsT0FBd0I7WUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELElBQUksVUFBVSxLQUFLLE1BQU07Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDdkMsTUFB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