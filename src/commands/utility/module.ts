import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { capitalize } from 'lodash';
import {
    Command,
    CommandContext,
    CommandoClient,
    GuildModule,
    GuildAuditLog,
    ModuleSchema,
    Util,
    ParseRawArguments,
    QuerySchema,
    CommandoMessage,
    Argument,
} from 'pixoll-commando';
import { ParsedModuleData, RawAuditLogName, RawModuleName } from '../../types';
import { basicEmbed, addDashes, replyAll, removeDashes, isTrue } from '../../utils/functions';

const modules: GuildModule[] = [];
const auditLogs: GuildAuditLog[] = [];

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
    isEmpty(_: string, message: CommandoMessage): boolean {
        const moduleName = getModuleName(message);
        return moduleName !== 'audit-logs';
    },
    async validate(value: string, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const moduleName = getModuleName(message);
        if (moduleName !== 'audit-logs') return true;
        const isValid = await argument.type?.validate(value, message, argument) ?? true;
        return isValid;
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

function getModuleName(message: CommandoMessage): GuildModule {
    return CommandoMessage.parseArgs(message.content)[1] as GuildModule;
}

function parseModuleData(data: Partial<ModuleSchema>): ParsedModuleData {
    return Object.fromEntries(Object.entries(Util.omit(data, [
        '__v', '_id', 'guild',
    ])).map(([key, value]) => {
        if (typeof value === 'boolean') return [key, isTrue(value)];
        return [key, Object.fromEntries(Object.entries(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            value ?? {} as NonNullable<typeof value>
        ).map(([nestedKey, nestedValue]) => [nestedKey, isTrue(nestedValue)]))];
    }));
}

export default class ModuleCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        const modulesObj = Util.omit(client.databaseSchemas.ModulesModel.schema.obj as ModuleSchema, [
            '__v', '_id', 'guild',
        ]);
        modules.push(...Object.keys(modulesObj).map(id =>
            addDashes<GuildModule>(id)
        ));
        auditLogs.push(...Object.keys(modulesObj.auditLogs).map(id =>
            addDashes<GuildAuditLog>(id)
        ));

        super(client, {
            name: 'module',
            group: 'utility',
            description: 'Diagnose the status of a module or sub-module, or toggle it on/off.',
            details: stripIndent`
            \`module\` can be either: ${modules.map(m => `\`${m}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            \`sub-module\` can be either: ${auditLogs.map(sm => `\`${sm}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            `,
            format: stripIndent`
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
                type: ApplicationCommandOptionType.Subcommand,
                name: 'diagnose',
                description: 'Diagnose a module or sub-module.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'module',
                    description: 'The module to diagnose.',
                    required: true,
                    choices: modules.map(m => ({ name: capitalize(m.replace('-', ' ')), value: m })),
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'sub-module',
                    description: 'The sub-module to diagnose. Only usable if "module" is "Audit Logs".',
                    choices: auditLogs.map(m => ({ name: capitalize(m), value: m })),
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'toggle',
                description: 'Toggle a module or sub-module on/off.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'module',
                    description: 'The module to toggle.',
                    required: true,
                    choices: modules.map(m => ({
                        name: capitalize(m.replace('-', ' ')),
                        value: m,
                    })),
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'sub-module',
                    description: 'The sub-module to toggle. Only usable if "module" is "Audit Logs".',
                    choices: auditLogs.map(m => ({
                        name: capitalize(m.replace('-', ' ')),
                        value: m,
                    })),
                }],
            }],
        });
    }

    public async run(
        context: CommandContext<true>, { subCommand, module: moduleName, subModule }: ParsedArgs
    ): Promise<void> {
        const lcSubCommand = subCommand.toLowerCase();
        const lcModule = moduleName.toLowerCase();
        const lcSubModule = moduleName === 'audit-logs' ? subModule?.toLowerCase() ?? null : null;

        const { guild } = context;
        const data = await guild.database.modules.fetch();
        if (!data) {
            await replyAll(context, basicEmbed({
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
    protected async runDiagnose(
        context: CommandContext<true>, data: ModuleSchema, moduleName: GuildModule, subModule: GuildAuditLog | null
    ): Promise<void> {
        const parsedData = parseModuleData(data);

        const rawModuleName = removeDashes<RawModuleName>(moduleName);
        const rawSubModuleName = subModule ? removeDashes<RawAuditLogName>(subModule) : null;
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

        const diagnose = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `Status of ${type}: ${subModule || moduleName}`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                **Status:** ${isEnabled ? 'Enabled' : 'Disabled'}
                ${subModule ? `**Parent module:** ${capitalize(moduleName)}` : ''}
                ${subModule ? `**Parent module status:** ${moduleStatus}` : ''}
            `)
            .setTimestamp();

        await replyAll(context, diagnose);
    }

    /**
     * The `toggle` sub-command
     */
    protected async runToggle(
        context: CommandContext<true>, data: ModuleSchema, moduleName: GuildModule, subModule: GuildAuditLog | null
    ): Promise<void> {
        const { guildId, guild } = context;

        const db = guild.database.modules;
        const rawModuleName = removeDashes<RawModuleName>(moduleName);
        const rawSubModuleName = subModule ? removeDashes<RawAuditLogName>(subModule) : null;
        const newDocument: QuerySchema<ModuleSchema> = {
            guild: guildId,
            ...parseModuleData(data),
        };
        if (!rawSubModuleName && rawModuleName !== 'auditLogs') {
            newDocument[rawModuleName] = !newDocument[rawModuleName];
        } else if (rawSubModuleName && rawModuleName === 'auditLogs') {
            newDocument[rawModuleName][rawSubModuleName] = !newDocument[rawModuleName][rawSubModuleName];
        }

        if (data) await db.update(data, newDocument);
        else await db.add(newDocument);

        const type = subModule ? 'sub-module' : 'module';
        const target = subModule ? `${moduleName}/${subModule}` : moduleName;
        const status = rawModuleName === 'auditLogs'
            ? rawSubModuleName && newDocument[rawModuleName][rawSubModuleName]
            : newDocument[rawModuleName];

        this.client.emit('moduleStatusChange', guild, target, status ?? false);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the ${type} \`${target}\``,
            fieldValue: `**New status:** ${status ? 'Enabled' : 'Disabled'}`,
        }));
    }
}
