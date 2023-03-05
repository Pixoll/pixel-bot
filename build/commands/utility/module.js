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
        '__v', '_id', 'guild',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RTtBQUN4RSxtQ0FBb0M7QUFDcEMscURBV3lCO0FBRXpCLHVDQUFvRjtBQUVwRixNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO0FBQ2xDLE1BQU0sU0FBUyxHQUFvQixFQUFFLENBQUM7QUFFdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO1FBQzdCLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSw2Q0FBNkM7UUFDckQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsT0FBTztLQUNqQixFQUFFO1FBQ0MsR0FBRyxFQUFFLFdBQVc7UUFDaEIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsTUFBTSxFQUFFLG1FQUFtRTtRQUMzRSxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxTQUFTO1FBQ2hCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsT0FBTyxVQUFVLEtBQUssWUFBWSxDQUFDO1FBQ3ZDLENBQUM7S0FDSixDQUFVLENBQUM7QUFLWixTQUFTLGFBQWEsQ0FBQyxPQUF3QjtJQUMzQyxPQUFPLGlDQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8s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