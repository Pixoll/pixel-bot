"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const modules = [];
const auditLogs = [];
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['diagnose', 'toggle'],
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
        super(client, {
            name: 'module',
            group: 'utility',
            description: 'Diagnose the status of a module or sub-module, or toggle it on/off.',
            details: (0, common_tags_1.stripIndent) `
            \`module\` can be either: ${modules.map(m => `\`${m}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            \`sub-module\` can be either: ${auditLogs.map(sm => `\`${sm}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            `,
            format: (0, common_tags_1.stripIndent) `
            module diagnose [module] <sub-module> - Diagnose a module or sub-module.
            module toggle [module] <sub-module> - Toggle a module or sub-module on/off.
            `,
            examples: [
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
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'module',
                            description: 'The module to diagnose.',
                            required: true,
                            choices: modules.map(m => ({ name: (0, lodash_1.capitalize)(m.replace('-', ' ')), value: m })),
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'sub-module',
                            description: 'The sub-module to diagnose. Only usable if "module" is "Audit Logs".',
                            choices: auditLogs.map(m => ({ name: (0, lodash_1.capitalize)(m), value: m })),
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'toggle',
                    description: 'Toggle a module or sub-module on/off.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'module',
                            description: 'The module to toggle.',
                            required: true,
                            choices: modules.map(m => ({
                                name: (0, lodash_1.capitalize)(m.replace('-', ' ')),
                                value: m,
                            })),
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'sub-module',
                            description: 'The sub-module to toggle. Only usable if "module" is "Audit Logs".',
                            choices: auditLogs.map(m => ({
                                name: (0, lodash_1.capitalize)(m.replace('-', ' ')),
                                value: m,
                            })),
                        }],
                }],
        });
    }
    async run(context, { subCommand, module: moduleName, subModule }) {
        const lcModule = moduleName.toLowerCase();
        const lcSubModule = moduleName === 'audit-logs' ? subModule?.toLowerCase() ?? null : null;
        const { guild } = context;
        const data = await guild.database.modules.fetch();
        if (!data) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }
        switch (subCommand) {
            case 'diagnose':
                return await this.runDiagnose(context, data, lcModule, lcSubModule);
            case 'toggle':
                return await this.runToggle(context, data, lcModule, lcSubModule);
        }
    }
    /**
     * The `diagnose` sub-command
     */
    async runDiagnose(context, data, moduleName, subModule) {
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
        const { guild } = context;
        const type = subModule ? 'sub-module' : 'module';
        const moduleStatus = isTopLevelModuleEnabled ? 'Enabled' : 'Disabled';
        const diagnose = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
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
        await (0, utils_1.replyAll)(context, diagnose);
    }
    /**
     * The `toggle` sub-command
     */
    async runToggle(context, data, moduleName, subModule) {
        const { guildId, guild } = context;
        const db = guild.database.modules;
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
        if (data)
            await db.update(data, newDocument);
        else
            await db.add(newDocument);
        const type = subModule ? 'sub-module' : 'module';
        const target = subModule ? `${moduleName}/${subModule}` : moduleName;
        const status = rawModuleName === 'auditLogs'
            ? rawSubModuleName && newDocument[rawModuleName][rawSubModuleName]
            : newDocument[rawModuleName];
        this.client.emit('moduleStatusChange', guild, target, status ?? false);
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the ${type} \`${target}\``,
            fieldValue: `**New status:** ${status ? 'Enabled' : 'Disabled'}`,
        }));
    }
}
exports.default = ModuleCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RTtBQUN4RSxtQ0FBb0M7QUFDcEMscURBWXlCO0FBRXpCLHVDQUFvRjtBQUVwRixNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO0FBQ2xDLE1BQU0sU0FBUyxHQUFvQixFQUFFLENBQUM7QUFFdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO1FBQzdCLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSw2Q0FBNkM7UUFDckQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsT0FBTztLQUNqQixFQUFFO1FBQ0MsR0FBRyxFQUFFLFdBQVc7UUFDaEIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsTUFBTSxFQUFFLG1FQUFtRTtRQUMzRSxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxTQUFTO1FBQ2hCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsT0FBTyxVQUFVLEtBQUssWUFBWSxDQUFDO1FBQ3ZDLENBQUM7S0FDSixDQUFVLENBQUM7QUFLWixTQUFTLGFBQWEsQ0FBQyxPQUF3QjtJQUMzQyxPQUFPLGlDQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8s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