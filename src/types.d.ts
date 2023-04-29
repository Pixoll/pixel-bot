import { Message } from 'discord.js';
import { BaseSchema, CommandoMessage, ModuleSchema } from 'pixoll-commando';

export type AnyMessage<InGuild extends boolean = boolean> = CommandoMessage<InGuild> | Message<InGuild>;

export type ParsedModuleData = Omit<ModuleSchema, keyof BaseSchema | 'guild'>;
