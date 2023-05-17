import { stripIndent } from 'common-tags';
import { APIEmbedField, ApplicationCommandOptionType, ApplicationCommandStringOptionData, EmbedBuilder } from 'discord.js';
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
    JSONIfySchema,
    BaseSchema,
    ReadonlyArgumentInfo,
} from 'pixoll-commando';
import { ParsedModuleData } from '../../types';
import { basicEmbed, camelToKebabCase, reply, isTrue, pixelColor, getSubCommand } from '../../utils';

declare function require<T>(id: string): T;

type ModulesInfo = MapValues<Omit<ModuleSchema, keyof BaseSchema | 'guild'>, APIEmbedField[], true>;

const modulesInfo = require<ModulesInfo>('../../../documents/modules.json');

const modules: GuildModule[] = [];
const auditLogs: GuildAuditLog[] = [];

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['diagnose', 'toggle', 'info'],
    parse(value: string): string {
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
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message);
        if (subCommand === 'info') return true;
        const moduleName = getModuleName(message);
        return moduleName !== 'audit-logs';
    },
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
type SubCommand = ParsedArgs['subCommand'];

function getModuleName(message: CommandoMessage): GuildModule {
    return CommandoMessage.parseArgs(message.content)[2] as GuildModule;
}

function parseModuleData(data: Partial<JSONIfySchema<ModuleSchema>>): ParsedModuleData {
    return Object.fromEntries(Object.entries(Util.omit(data, [
        '_id', 'guild',
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
        modules.push(...Object.keys(modulesObj).map(camelToKebabCase));
        auditLogs.push(...Object.keys(modulesObj.auditLogs).map(camelToKebabCase));

        const moduleChoices = modules.map(m => ({
            name: Util.capitalize(m.replace('-', ' ')),
            value: m,
        }));
        const submoduleChoices = auditLogs.map(m => ({
            name: Util.capitalize(m.replace('-', ' ')),
            value: m,
        }));

        const generateSubcommandOptions = (action: string): ApplicationCommandStringOptionData[] => [{
            type: ApplicationCommandOptionType.String,
            name: 'module',
            description: `The module to ${action}.`,
            required: true,
            choices: moduleChoices,
        }, {
            type: ApplicationCommandOptionType.String,
            name: 'sub-module',
            description: `The sub-module to ${action}. Only usable if "module" is "Audit Logs".`,
            choices: submoduleChoices,
        }];

        super(client, {
            name: 'module',
            group: 'utility',
            description: 'Diagnose the status of a module or sub-module, or toggle it on/off.',
            detailedDescription: stripIndent`
            \`module\` can be either: ${modules.map(m => `\`${m}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            \`sub-module\` can be either: ${auditLogs.map(sm => `\`${sm}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            `,
            format: stripIndent`
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
                type: ApplicationCommandOptionType.Subcommand,
                name: 'diagnose',
                description: 'Diagnose a module or sub-module.',
                options: generateSubcommandOptions('diagnose'),
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'toggle',
                description: 'Toggle a module or sub-module on/off.',
                options: generateSubcommandOptions('toggle'),
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'info',
                description: 'Get detailed information from a module.',
                options: generateSubcommandOptions('get information from').slice(0, 1),
            }],
        });
    }

    public async run(
        context: CommandContext<true>, { subCommand, module: moduleName, subModule }: ParsedArgs
    ): Promise<void> {
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

    protected async runInfo(context: CommandContext<true>, moduleName: GuildModule): Promise<void> {
        const { client } = context;
        const rawModuleName = Util.kebabToCamelCase(moduleName);
        const moduleInfo = modulesInfo[rawModuleName];

        const embed = new EmbedBuilder()
            .setColor(pixelColor)
            .setAuthor({
                name: `${client.user.username}'s modules`,
                iconURL: client.user.displayAvatarURL(),
            })
            .setTitle(`Module: ${Util.capitalize(moduleName.replace(/-/g, ' '))}`)
            .setFields(moduleInfo)
            .setTimestamp();

        await reply(context, embed);
    }

    /**
     * The `diagnose` sub-command
     */
    protected async runDiagnose(
        context: CommandContext<true>,
        moduleName: GuildModule,
        subModule: GuildAuditLog | null
    ): Promise<void> {
        const { guild } = context;
        const data = await guild.database.modules.fetch();
        if (!data) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }

        const parsedData = parseModuleData(data);

        const rawModuleName = Util.kebabToCamelCase(moduleName);
        const rawSubModuleName = subModule ? Util.kebabToCamelCase(subModule) : null;
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

        const diagnose = new EmbedBuilder()
            .setColor(pixelColor)
            .setAuthor({
                name: `Status of ${type}: ${subModule || moduleName}`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                **Status:** ${isEnabled ? 'Enabled' : 'Disabled'}
                ${subModule ? `**Parent module:** ${Util.capitalize(moduleName)}` : ''}
                ${subModule ? `**Parent module status:** ${moduleStatus}` : ''}
            `)
            .setTimestamp();

        await reply(context, diagnose);
    }

    /**
     * The `toggle` sub-command
     */
    protected async runToggle(
        context: CommandContext<true>,
        moduleName: GuildModule,
        subModule: GuildAuditLog | null
    ): Promise<void> {
        const { guildId, guild } = context;
        const db = guild.database.modules;
        const data = await db.fetch();
        if (!data) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup` command first.',
            }));
            return;
        }

        const rawModuleName = Util.kebabToCamelCase(moduleName);
        const rawSubModuleName = subModule ? Util.kebabToCamelCase(subModule) : null;
        const newDocument: QuerySchema<ModuleSchema> = {
            guild: guildId,
            ...parseModuleData(data),
        };
        if (!rawSubModuleName && rawModuleName !== 'auditLogs') {
            newDocument[rawModuleName] = !newDocument[rawModuleName];
        } else if (rawSubModuleName && rawModuleName === 'auditLogs') {
            newDocument[rawModuleName][rawSubModuleName] = !newDocument[rawModuleName][rawSubModuleName];
        }

        await db.update(data, newDocument);

        const type = subModule ? 'sub-module' : 'module';
        const target = subModule ? `${moduleName}/${subModule}` : moduleName;
        const status = rawModuleName === 'auditLogs'
            ? rawSubModuleName && newDocument[rawModuleName][rawSubModuleName]
            : newDocument[rawModuleName];

        this.client.emit('moduleStatusChange', guild, target, status ?? false);

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the ${type} \`${target}\``,
            fieldValue: `**New status:** ${status ? 'Enabled' : 'Disabled'}`,
        }));
    }
}
