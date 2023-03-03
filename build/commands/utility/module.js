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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RTtBQUN4RSxtQ0FBb0M7QUFDcEMscURBWXlCO0FBRXpCLHFEQUE4RjtBQUU5RixNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO0FBQ2xDLE1BQU0sU0FBUyxHQUFvQixFQUFFLENBQUM7QUFFdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO1FBQzdCLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSw2Q0FBNkM7UUFDckQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsT0FBTztLQUNqQixFQUFFO1FBQ0MsR0FBRyxFQUFFLFdBQVc7UUFDaEIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsTUFBTSxFQUFFLG1FQUFtRTtRQUMzRSxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxTQUFTO1FBQ2hCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVMsRUFBRSxPQUF3QjtZQUN2QyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsT0FBTyxVQUFVLEtBQUssWUFBWSxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLGFBQWEs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