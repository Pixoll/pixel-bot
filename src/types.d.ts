import { Message } from 'discord.js';
import { CommandoMessage, ModuleSchema } from 'pixoll-commando';

export type ParsedModuleName = keyof Pick<ModuleSchema, 'auditLogs' |'stickyRoles' | 'welcome'>;
export type AnyMessage<InGuild extends boolean = boolean> = CommandoMessage<InGuild> | Message<InGuild>;
