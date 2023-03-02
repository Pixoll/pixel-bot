"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const modules = [];
const auditLogs = [];
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['diagnose', 'toggle'],
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
        async validate(value, message, argument) {
            const moduleName = getModuleName(message);
            if (moduleName !== 'audit-logs')
                return true;
            const isValid = await argument.type?.validate(value, message, argument) ?? true;
            return isValid;
        },
    }];
function getModuleName(message) {
    return pixoll_commando_1.CommandoMessage.parseArgs(message.content)[1];
}
function parseModuleData(data) {
    return Object.fromEntries(Object.entries(pixoll_commando_1.Util.omit(data, [
        '__v', '_id', 'guild',
    ])).map(([key, value]) => {
        if (typeof value === 'boolean')
            return [key, (0, functions_1.isTrue)(value)];
        return [key, Object.fromEntries(Object.entries(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            value ?? {}).map(([nestedKey, nestedValue]) => [nestedKey, (0, functions_1.isTrue)(nestedValue)]))];
    }));
}
class ModuleCommand extends pixoll_commando_1.Command {
    constructor(client) {
        const modulesObj = pixoll_commando_1.Util.omit(client.databaseSchemas.ModulesModel.schema.obj, [
            '__v', '_id', 'guild',
        ]);
        modules.push(...Object.keys(modulesObj).map(id => (0, functions_1.addDashes)(id)));
        auditLogs.push(...Object.keys(modulesObj.auditLogs).map(id => (0, functions_1.addDashes)(id)));
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
        const lcSubCommand = subCommand.toLowerCase();
        const lcModule = moduleName.toLowerCase();
        const lcSubModule = moduleName === 'audit-logs' ? subModule?.toLowerCase() ?? null : null;
        const { guild } = context;
        const data = await guild.database.modules.fetch();
        if (!data) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }
        switch (lcSubCommand) {
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
        const rawModuleName = (0, functions_1.removeDashes)(moduleName);
        const rawSubModuleName = subModule ? (0, functions_1.removeDashes)(subModule) : null;
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
        await (0, functions_1.replyAll)(context, diagnose);
    }
    /**
     * The `toggle` sub-command
     */
    async runToggle(context, data, moduleName, subModule) {
        const { guildId, guild } = context;
        const db = guild.database.modules;
        const rawModuleName = (0, functions_1.removeDashes)(moduleName);
        const rawSubModuleName = subModule ? (0, functions_1.removeDashes)(subModule) : null;
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the ${type} \`${target}\``,
            fieldValue: `**New status:** ${status ? 'Enabled' : 'Disabled'}`,
        }));
    }
}
exports.default = ModuleCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RTtBQUN4RSxtQ0FBb0M7QUFDcEMscURBWXlCO0FBRXpCLHFEQUE4RjtBQUU5RixNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO0FBQ2xDLE1BQU0sU0FBUyxHQUFvQixFQUFFLENBQUM7QUFFdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO0tBQ2hDLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSw2Q0FBNkM7UUFDckQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsT0FBTztLQUNqQixFQUFFO1FBQ0MsR0FBRyxFQUFFLFdBQVc7UUFDaEIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsTUFBTSxFQUFFLG1FQUFtRTtRQUMzRSxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxTQUFTO1FBQ2hCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVMsRUFBRSxPQUF3QjtZQUN2QyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsT0FBTyxVQUFVLEtBQUssWUFBWSxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQyxJQUFJLFVBQVUsS0FBSyxZQUFZO2dCQUFFLE9BQU8sSUFBSSxDQUFD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