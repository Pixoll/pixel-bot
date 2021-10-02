import { Client, ClientEvents, ClientOptions, Collection, Guild, GuildResolvable, Message, MessageAttachment, MessageEditOptions, MessageEmbed, MessageOptions, MessageAdditions, PermissionResolvable, PermissionString, User, UserResolvable, InviteGenerationOptions, GuildMember, ClientUser } from 'discord.js'

/** A fancy argument */
export class Argument {
	/**
	 * @param client Client the argument is for
	 * @param info Information for the command argument
	 */
	private constructor(client: CommandoClient, info: ArgumentInfo)

	/**
	 * Prompts the user and obtains multiple values for the argument
	 * @param msg Message that triggered the command
	 * @param vals Pre-provided values for the argument
	 * @param promptLimit Maximum number of times to prompt for the argument
	 */
	private obtainInfinite(msg: CommandoMessage, vals?: string[], promptLimit?: number): Promise<ArgumentResult>

	/**
	 * Validates the constructor parameters
	 * @param client Client to validate
	 * @param info Info to validate
	 */
	private static validateInfo(client: CommandoClient, info: ArgumentInfo): void

	/**
	 * Whether the argument is required or not
	 * @default true
	 */
	public required?: boolean
	/** The default value for the argument */
	public default: ArgumentDefault
	/** Function to check whether a raw value is considered empty */
	public emptyChecker: Function
	/**
	 * Error message for when a value is invalid
	 *  @see {@link ArgumentType#isEmpty}
	 */
	public error: string
	/** Whether the argument accepts an infinite number of values */
	public infinite: boolean
	/** Key for the argument */
	public key: string
	/** Label for the argument */
	public label: string
	/**
	 * - If type is `integer` or `float`, this is the maximum value of the number.
	 * - If type is `string`, this is the maximum length of the string.
	 */
	public max: number
	/**
	 * - If type is `integer` or `float`, this is the minimum value of the number.
	 * - If type is `string`, this is the minimum length of the string.
	 */
	public min: number
	/**
	 * Values the user can choose from.
	 * - If type is `string`, this will be case-insensitive.
	 * - If type is `channel`, `member`, `role`, or `user`, this will be the ids.
	 */
	public oneOf: string[]
	/**
	 * Parser function for parsing a value for the argument
	 *  @see {@link ArgumentType#parse}
	 */
	public parser: Function
	/** Question prompt for the argument */
	public prompt: string
	/** Type of the argument */
	public type: ArgumentType
	/**
	 * Validator function for validating a value for the argument
	 *  @see {@link ArgumentType#validate}
	 */
	public validator: Function
	/** How long to wait for input (in seconds) */
	public wait: number

	/**
	 * Checks whether a value for the argument is considered to be empty
	 * @param val Value to check for emptiness
	 * @param msg Message that triggered the command
	 */
	public isEmpty(val: string, msg: CommandoMessage): boolean
	/**
	 * Prompts the user and obtains the value for the argument
	 * @param msg Message that triggered the command
	 * @param val Pre-provided value for the argument
	 * @param promptLimit Maximum number of times to prompt for the argument
	 */
	public obtain(msg: CommandoMessage, val?: string, promptLimit?: number): Promise<ArgumentResult>
	/**
	 * Parses a value string into a proper value for the argument
	 * @param val Value to parse
	 * @param msg Message that triggered the command
	 */
	public parse(val: string, msg: CommandoMessage): any | Promise<any>
	/**
	 * Checks if a value is valid for the argument
	 * @param val Value to check
	 * @param msg Message that triggered the command
	 */
	public validate(val: string, msg: CommandoMessage): boolean | string | Promise<boolean | string>
}

/** Obtains, validates, and prompts for argument values */
export class ArgumentCollector {
	/**
	 * @param client Client the collector will use
	 * @param args Arguments for the collector
	 * @param promptLimit Maximum number of times to prompt for a single argument
	 */
	public constructor(client: CommandoClient, args: ArgumentInfo[], promptLimit?: number)

	/** Arguments the collector handles */
	public args: Argument[]
	/** Client this collector is for */
	public readonly client: CommandoClient
	/** Maximum number of times to prompt for a single argument */
	public promptLimit: number

	/**
	 * Obtains values for the arguments, prompting if necessary.
	 * @param msg Message that the collector is being triggered by
	 * @param provided Values that are already available
	 * @param promptLimit Maximum number of times to prompt for a single argument
	 */
	public obtain(msg: CommandoMessage, provided?: any[], promptLimit?: number): Promise<ArgumentCollectorResult>
}

/** A type for command arguments */
export abstract class ArgumentType {
	/**
	 * @param client The client the argument type is for
	 * @param id The argument type id (this is what you specify in {@link ArgumentInfo#type})
	 */
	public constructor(client: CommandoClient, id: string)

	/** Client that this argument type is for */
	public readonly client: CommandoClient
	/** Id of this argument type (this is what you specify in {@link ArgumentInfo#type}) */
	public id: string

	/**
	 * Checks whether a value is considered to be empty.
	 * This determines whether the default value for an argument should be
	 * used and changesthe response to the user under certain circumstances.
	 * @param val Value to check for emptiness
	 * @param msg Message that triggered the command
	 * @param arg Argument the value was obtained from
	 * @returns Whether the value is empty
	 */
	public isEmpty(val: string, msg: CommandoMessage, arg: Argument): boolean
	/**
	 * Parses the raw value string into a usable value
	 * @param val Value to parse
	 * @param msg Message that triggered the command
	 * @param arg Argument the value was obtained from
	 * @returns Usable value
	 */
	public abstract parse(val: string, msg: CommandoMessage, arg: Argument): any | Promise<any>
	/**
	 * Validates a value string against the type
	 * @param val Value to validate
	 * @param msg Message that triggered the command
	 * @param arg Argument the value was obtained from
	 * @returns Whether the value is valid, or an error message
	 */
	public abstract validate(val: string, msg: CommandoMessage, arg: Argument): boolean | string | Promise<boolean | string>
}

/** A type for command arguments that handles multiple other types */
export class ArgumentUnionType extends ArgumentType {
	/** Types to handle, in order of priority */
	public types: ArgumentType[]

	/**
	 * Parses the raw value string into a usable value
	 * @param val Value to parse
	 * @param msg Message that triggered the command
	 * @param arg Argument the value was obtained from
	 * @returns Usable value
	 */
	public parse(val: string, msg: CommandoMessage, arg: Argument): any | Promise<any>
	/**
	 * Validates a value string against the type
	 * @param val Value to validate
	 * @param msg Message that triggered the command
	 * @param arg Argument the value was obtained from
	 * @returns Whether the value is valid, or an error message
	 */
	public validate(val: string, msg: CommandoMessage, arg: Argument): string | boolean | Promise<string | boolean>
}

/** A command that can be run in a client */
export abstract class Command {
	/**
	 * @param client The client the command is for
	 * @param info The command information
	 */
	public constructor(client: CommandoClient, info: CommandInfo)

	/** Whether the command is enabled globally */
	private _globalEnabled: boolean
	/** Current throttle objects for the command, mapped by user id */
	private _throttles: Map<string, object>

	/**
	 * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
	 * @param userId id of the user to throttle for
	 */
	private throttle(userId: string): Throttle | null

	/**
	 * Validates the constructor parameters
	 * @param client Client to validate
	 * @param info Info to validate
	 */
	private static validateInfo(client: CommandoClient, info: CommandInfo)

	/** Aliases for this command */
	public aliases: string[]
	/** The argument collector for the command */
	public argsCollector: ArgumentCollector
	/**
	 * Maximum number of arguments that will be split
	 * @default 0
	 */
	public argsCount: number
	/**
	 * Whether single quotes are allowed to encapsulate an argument
	 * @default true
	 */
	public argsSingleQuotes: boolean
	/**
	 * How the arguments are split when passed to the command's run method
	 * @default 'single'
	 */
	public argsType: string
	/** Client that this command is for */
	public readonly client: CommandoClient
	/** Permissions required by the client to use the command. */
	public clientPermissions: PermissionResolvable[]
	/**
	 * Whether the default command handling is enabled for the command
	 * @default true
	 */
	public defaultHandling: boolean
	/** Short description of the command */
	public description: string
	/** Long description of the command */
	public details: string
	/**
	 * Whether the command can only be run in direct messages
	 * @default false
	 */
	public dmOnly: boolean
	/** Example usage strings */
	public examples: string[]
	/** Usage format string of the command */
	public format: string
	/** The group the command belongs to, assigned upon registration */
	public group: CommandGroup
	/** id of the group the command belongs to */
	public groupId: string
	/**
	 * Whether the command is protected from being disabled
	 * @default false
	 */
	public guarded: boolean
	/**
	 * Whether the command can only be run in a guild channel
	 * @default false
	 */
	public guildOnly: boolean
	/**
	 * Whether the command should be hidden from the help command
	 * @default false
	 */
	public hidden: boolean
	/**
	 * Name of the command within the group
	 * @default this.name
	 */
	public memberName: string
	/** Name of this command */
	public name: string
	/**
	 * Whether the command can only be used in NSFW channels
	 * @default false
	 */
	public nsfw: boolean
	/**
	 * Whether the command can only be used by an owner
	 * @default false
	 */
	public ownerOnly: boolean
	/** Regular expression triggers */
	public patterns: RegExp[]
	/**
	 * Whether the command can only be run by the server's owner
	 * @default false
	 */
	public serverOwnerOnly: boolean
	/** Options for throttling command usages */
	public throttling: ThrottlingOptions
	/**
	 * Whether the command will be run when an unknown command is used
	 * @default false
	 */
	public unknown: boolean
	/** Permissions required by the user to use the command */
	public userPermissions: PermissionResolvable[]

	/**
	 * Checks whether the user has permission to use the command
	 * @param message The triggering command message
	 * @param ownerOverride Whether the bot owner(s) will always have permission
	 */
	public hasPermission(message: CommandoMessage, ownerOverride?: boolean): boolean | PermissionString[]
	/**
	 * Checks if the command is enabled in a guild
	 * @param guild Guild to check in
	 * @param bypassGroup Whether to bypass checking the group's status
	 */
	public isEnabledIn(guild: GuildResolvable, bypassGroup?: boolean): boolean
	/**
	 * Checks if the command is usable for a message
	 * @param message The message
	 */
	public isUsable(message?: Message): boolean
	/**
	 * Called when the command is prevented from running
	 * @param message Command message that the command is running from
	 * @param reason Reason that the command was blocked (built-in reasons are `guildOnly`, `nsfw`, `permission`, `throttling`, and `clientPermissions`)
	 * @param data Additional data associated with the block. Built-in reason data properties:
	 * - guildOnly & nsfw & dmOnly: none
	 * - throttling: `throttle` ({@link Throttle}), `remaining` (number) time in seconds
	 * - userPermissions & clientPermissions: `missing` (Array<{@link PermissionString}>) permission names
	 */
	public onBlock(message: CommandoMessage, reason: CommandBlockReason, data?: CommandBlockData): Promise<Message | Message[]>
	/**
	 * Called when the command produces an error while running
	 * @param err Error that was thrown
	 * @param message Command message that the command is running from (see {@link Command#run})
	 * @param args Arguments for the command (see {@link Command#run})
	 * @param fromPattern Whether the args are pattern matches (see {@link Command#run})
	 * @param result Result from obtaining the arguments from the collector (if applicable - see {@link Command#run})
	 */
	public onError(err: Error, message: CommandoMessage, args: object | string | string[], fromPattern: boolean, result?: ArgumentCollectorResult): Promise<Message | Message[]>
	/** Reloads the command */
	public reload(): void
	/**
	 * Runs the command
	 * @param message The message the command is being run for
	 * @param args The arguments for the command, or the matches from a pattern.
	 * - If args is specified on the command, thise will be the argument values object.
	 * - If argsType is single, then only one string will be passed.
	 * - If multiple, an array of strings will be passed.
	 * - When fromPattern is true, this is the matches array from the pattern match (see {@link RegExp#exec}).
	 * @param fromPattern Whether or not the command is being run from a pattern match
	 * @param result Result from obtaining the arguments from the collector (if applicable)
	 */
	public abstract run(message: CommandoMessage, args: object | string | string[], fromPattern: boolean, result?: ArgumentCollectorResult): Promise<Message | Message[] | null> | null
	/**
	 * Enables or disables the command in a guild
	 * @param guild Guild to enable/disable the command in
	 * @param enabled Whether the command should be enabled or disabled
	 */
	public setEnabledIn(guild: GuildResolvable, enabled: boolean): void
	/** Unloads the command */
	public unload(): void
	/**
	 * Creates a usage string for the command
	 * @param argString A string of arguments for the command
	 * @param prefix Prefix to use for the prefixed command format
	 * @param user User to use for the mention command format
	 */
	public usage(argString?: string, prefix?: string, user?: User): string

	/**
	 * Creates a usage string for a command
	 * @param command A command + arg string
	 * @param prefix Prefix to use for the prefixed command format
	 * @param user User to use for the mention command format
	 */
	public static usage(command: string, prefix?: string, user?: User): string
}

/** Handles parsing messages and running commands from them */
export class CommandDispatcher {
	/**
	 * @param client Client the dispatcher is for
	 * @param registry Registry the dispatcher will use
	 */
	public constructor(client: CommandoClient, registry: CommandoRegistry)

	/** Tuples in string form of user id and channel id that are currently awaiting messages from a user in a channel */
	private _awaiting: Set<string>
	/** Map object of {@link RegExp}s that match command messages, mapped by string prefix */
	private _commandPatterns: object
	/** Old command message results, mapped by original message id */
	private _results: Map<string, CommandoMessage>

	/**
	 * Creates a regular expression to match the command prefix and name in a message
	 * @param prefix Prefix to build the pattern for
	 */
	private buildCommandPattern(prefix: string): RegExp
	/**
	 * Caches a command message to be editable
	 * @param message Triggering message
	 * @param oldMessage Triggering message's old version
	 * @param cmdMsg Command message to cache
	 * @param responses Responses to the message
	 */
	private cacheCommandoMessage(message: Message, oldMessage: Message, cmdMsg: CommandoMessage, responses: Message | Message[]): void
	/**
	 * Handle a new message or a message update
	 * @param message The message to handle
	 * @param oldMessage The old message before the update
	 */
	private handleMessage(message: Message, oldMessage?: Message): Promise<void>
	/**
	 * Inhibits a command message
	 * @param cmdMsg Command message to inhibit
	 */
	private inhibit(cmdMsg: CommandoMessage): Inhibition
	/**
	 * Matches a message against a guild command pattern
	 * @param message The message
	 * @param pattern The pattern to match against
	 * @param commandNameIndex The index of the command name in the pattern matches
	 * @param prefixless Whether the match is happening for a prefixless usage
	 */
	private matchDefault(message: Message, pattern: RegExp, commandNameIndex?: number, prefixless?: boolean): CommandoMessage
	/**
	 * Parses a message to find details about command usage in it
	 * @param message The message
	 */
	private parseMessage(message: Message): CommandoMessage
	/**
	 * Check whether a message should be handled
	 * @param message The message to handle
	 * @param oldMessage The old message before the update
	 */
	private shouldHandleMessage(message: Message, oldMessage?: Message): boolean

	/** Client this dispatcher handles messages for */
	public readonly client: CommandoClient
	/** Functions that can block commands from running */
	public inhibitors: Set<Function>
	/** Registry this dispatcher uses */
	public registry: CommandoRegistry

	/**
	 * Adds an inhibitor
	 * @param inhibitor The inhibitor function to add
	 * @returns Whether the addition was successful
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
		 *	if(blacklistedUsers.has(msg.author.id)) return 'blacklisted'
	 * })
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
	 * 	if(!coolUsers.has(msg.author.id)) return {
	 * 		reason: 'cool',
	 * 		response: msg.reply('You\'re not cool enough!')
	 * 	}
	 * })
	 */
	public addInhibitor(inhibitor: Inhibitor): boolean
	/**
	 * Removes an inhibitor
	 * @param inhibitor The inhibitor function to remove
	 * @returns Whether the removal was successful
	 */
	public removeInhibitor(inhibitor: Inhibitor): boolean
}

/** Has a descriptive message for a command not having proper format */
export class CommandFormatError extends FriendlyError {
	/**
	 * @param msg The command message the error is for
	 */
	public constructor(msg: CommandoMessage)
}

/** A group for commands. Whodathunkit? */
export class CommandGroup {
	/**
	 * @param client The client the group is for
	 * @param id The id for the group
	 * @param name The name of the group
	 * @param guarded Whether the group should be protected from disabling
	 */
	public constructor(client: CommandoClient, id: string, name?: string, guarded?: boolean)

	/** Client that this group is for */
	public readonly client: CommandoClient
	/** The commands in this group (added upon their registration) */
	public commands: Collection<string, Command>
	/** Whether or not this group is protected from being disabled */
	public guarded: boolean
	/** id of this group */
	public id: string
	/** Name of this group */
	public name: string

	/**
	 * Checks if the group is enabled in a guild
	 * @param guild Guild to check in
	 * @returns Whether or not the group is enabled
	 */
	public isEnabledIn(guild: GuildResolvable): boolean
	/** Reloads all of the group's commands */
	public reload(): void
	/**
	 * Enables or disables the group in a guild
	 * @param guild Guild to enable/disable the group in
	 * @param enabled Whether the group should be enabled or disabled
	 */
	public setEnabledIn(guild: GuildResolvable, enabled: boolean): void
}

/** Discord.js Client with a command framework */
export class CommandoClient extends Client {
	/**
	 * @param options Options for the client
	 */
	public constructor(options?: CommandoClientOptions)

	/** Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter */
	private _prefix: string

	/**
	 * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
	 * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
	 */
	public prefix: string
	/** The client's command dispatcher */
	public dispatcher: CommandDispatcher
	/** Options for the client */
	public options: CommandoClientOptions
	/** Invite for the bot */
	public botInvite?: string
	/**
	 * Owners of the bot, set by the {@link CommandoClientOptions#owner} option
	 * - If you simply need to check if a user is an owner of the bot, please instead use {@link CommandoClient#isOwner}.
	 */
	public readonly owners: User[]
	/** The client's setting provider */
	public provider: SettingProvider
	/** The client's command registry */
	public registry: CommandoRegistry
	/** Shortcut to use setting provider methods for the global settings */
	public settings: GuildSettingsHelper

	/**
	 * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
	 * @param user User to check for ownership
	 */
	public isOwner(user: UserResolvable): boolean
	/**
	 * Sets the setting provider to use, and initialises it once the client is ready
	 * @param provider Provider to use
	 */
	public setProvider(provider: SettingProvider | Promise<SettingProvider>): Promise<void>

	public on<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void): this
	public once<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void): this
	public emit<K extends keyof CommandoClientEvents>(event: K, ...args: CommandoClientEvents[K]): boolean
}

export { CommandoClient as Client }

/** A fancier Guild for fancier people. */
export class CommandoGuild extends Guild {
	/** Internal command prefix for the guild, controlled by the {@link CommandoGuild#prefix} getter/setter */
	private _prefix: string
	/** Map object of internal command statuses, mapped by command name */
	private _commandsEnabled: object
	/** Internal map object of group statuses, mapped by group id */
	private _groupsEnabled: object
	/** Shortcut to use setting provider methods for this guild */
	private _settings: GuildSettingsHelper

	/**
	 * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
	 * Setting to `null` means that the prefix from {@link CommandoClient#prefix} will be used instead.
	 */
	public prefix: string
	/** Shortcut to use setting provider methods for this guild */
	public readonly settings: GuildSettingsHelper

	/**
	 * Creates a command usage string using the guild's prefix
	 * @param command A command + arg string
	 * @param user User to use for the mention command format
	 */
	public commandUsage(command?: string, user?: User): string
	/**
	 * Checks whether a command is enabled in the guild (does not take the command's group status into account)
	 * @param command Command to check status of
	 */
	public isCommandEnabled(command: CommandResolvable): boolean
	/**
	 * Checks whether a command group is enabled in the guild
	 * @param group Group to check status of
	 */
	public isGroupEnabled(group: CommandGroupResolvable): boolean
	/**
	 * Sets whether a command is enabled in the guild
	 * @param command Command to set status of
	 * @param enabled Whether the command should be enabled
	 */
	public setCommandEnabled(command: CommandResolvable, enabled: boolean): void
	/**
	 * Sets whether a command group is enabled in the guild
	 * @param group Group to set status of
	 * @param enabled Whether the group should be enabled
	 */
	public setGroupEnabled(group: CommandGroupResolvable, enabled: boolean): void
}

/** An extension of the base Discord.js Message class to add command-related functionality. */
export class CommandoMessage extends Message {
	/** The client this message is for */
	public readonly client: CommandoClient
	/** The client member this message is for */
	public readonly clientMember?: ClientGuildMember
	/** Argument string for the command */
	public argString: string | null
	/** Command that the message triggers, if any */
	public command: Command | null
	/** Whether the message contains a command (even an unknown one) */
	public isCommand: boolean
	/** Pattern matches (if from a pattern trigger) */
	public patternMatches: string[] | null
	/** Index of the current response that will be edited, mapped by channel id */
	public responsePositions: { [key: string]: number } | null
	/** Response messages sent, mapped by channel id (set by the dispatcher after running the command) */
	public responses: { [key: string]: CommandoMessage[] } | null
	/** The guild the message was sent in (if in a guild channel) */
	public readonly guild: CommandoGuild

	/** Deletes any prior responses that haven't been updated */
	private deleteRemainingResponses(): void
	/**
	 * Edits the current response
	 * @param id The id of the channel the response is in ("DM" for direct messages)
	 * @param options Options for the response
	 */
	private editCurrentResponse(id: string, options: MessageEditOptions | Exclude<MessageAdditions, MessageAttachment>): Promise<CommandoMessage | CommandoMessage[]>
	/**
	 * Edits a response to the command message
	 * @param response The response message(s) to edit
	 * @param options Options for the response
	 */
	private editResponse(response: CommandoMessage | CommandoMessage[], options: RespondEditOptions): Promise<CommandoMessage | CommandoMessage[]>
	/**
	 * Finalizes the command message by setting the responses and deleting any remaining prior ones
	 * @param responses Responses to the message
	 */
	private finalize(responses: (CommandoMessage | CommandoMessage[])[]): void
	/**
	 * Responds to the command message
	 * @param options Options for the response
	 */
	private respond(options: RespondOptions): Promise<CommandoMessage | CommandoMessage[]>

	/**
	 * Creates a usage string for any command
	 * @param argString A command + arg string
	 * @param prefix Prefix to use for the prefixed command format
	 * @param user User to use for the mention command format
	 */
	public anyUsage(argString?: string, prefix?: string, user?: User): string
	/**
	 * Responds with a code message
	 * @param lang Language for the code block
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	// public code: CommandoMessage['say']
	/**
	 * Responds with a direct message
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	// public direct: CommandoMessage['say']
	/**
	 * Responds with an embed
	 * @param embed Embed to send
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	// public embed(embed: MessageEmbed, content?: StringResolvable, options?: (MessageOptions & { split?: false }) | MessageAdditions): Promise<CommandoMessage>
	/**
	 * Responds with an embed
	 * @param embed Embed to send
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	// public embed(embed: MessageEmbed, content?: StringResolvable, options?: (MessageOptions & { split: true }) | MessageAdditions): Promise<CommandoMessage[]>
	/**
	 * Initialises the message for a command
	 * @param command Command the message triggers
	 * @param argString Argument string for the command
	 * @param patternMatches Command pattern matches (if from a pattern trigger)
	 */
	public initCommand(command?: Command, argString?: string[], patternMatches?: string[]): this
	/**
	 * Parses the argString into usable arguments, based on the argsType and argsCount of the command
	 *  @see {@link Command#run}
	 */
	public parseArgs(): string | string[]
	/**
	 * Responds with a mention + embed
	 * @param embed Embed to send
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	// public replyEmbed: CommandoMessage['embed']
	/** Runs the command */
	public run(): Promise<null | CommandoMessage | CommandoMessage[]>
	/**
	 * Responds with a plain message
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	public say(
		content: StringResolvable | MessageOptions | MessageAdditions,
		options?: MessageOptions | MessageAdditions
	): Promise<CommandoMessage>
	/**
	 * Responds with a direct message
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	public direct(
		content: StringResolvable | MessageOptions | MessageAdditions,
		options?: MessageOptions | MessageAdditions
	): Promise<CommandoMessage>
	/**
	 * Responds with a code message
	 * @param lang Language for the code block
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	public code(
		lang: string,
		content: StringResolvable | MessageOptions | MessageAdditions,
		options?: MessageOptions | MessageAdditions
	): Promise<CommandoMessage>
	/**
	 * Responds with an embed
	 * @param embed Embed to send
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	public embed(
		embed: MessageEmbed | MessageEmbed[],
		content?: StringResolvable | MessageOptions | MessageAdditions,
		options?: MessageOptions | MessageAdditions
	): Promise<CommandoMessage>
	/**
	 * Responds with a reply + embed
	 * @param embed Embed to send
	 * @param content Content for the message
	 * @param options Options for the message
	 */
	public replyEmbed(
		embed: MessageEmbed | MessageEmbed[],
		content?: StringResolvable | MessageOptions | MessageAdditions,
		options?: MessageOptions | MessageAdditions
	): Promise<CommandoMessage>
	/**
	 * Creates a usage string for the message's command
	 * @param argString A string of arguments for the command
	 * @param prefix Prefix to use for the prefixed command format
	 * @param user User to use for the mention command format
	 */
	public usage(argString?: string, prefix?: string, user?: User): string

	/**
	 * Parses an argument string into an array of arguments
	 * @param argString The argument string to parse
	 * @param argCount The number of arguments to extract from the string
	 * @param allowSingleQuote Whether or not single quotes should be allowed to wrap arguments, in addition to double quotes
	 */
	public static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[]
}

/** Handles registration and searching of commands and groups */
export class CommandoRegistry {
	/**
	 * @param client Client to use
	 */
	public constructor(client?: CommandoClient)

	/** The client this registry is for */
	public readonly client: CommandoClient
	/** Registered commands, mapped by their name */
	public commands: Collection<string, Command>
	/** Fully resolved path to the bot's commands directory */
	public commandsPath: string
	/** Registered command groups, mapped by their id */
	public groups: Collection<string, CommandGroup>
	/** Registered argument types, mapped by their id */
	public types: Collection<string, ArgumentType>
	/** Command to run when an unknown command is used */
	public unknownCommand?: Command

	/**
	 * Finds all commands that match the search string
	 * @param searchString The string to search for
	 * @param exact Whether the search should be exact
	 * @param message The message to check usability against
	 * @returns All commands that are found
	 */
	public findCommands(searchString?: string, exact?: boolean, message?: Message | CommandoMessage): Command[]
	/**
	 * Finds all groups that match the search string
	 * @param searchString The string to search for
	 * @param exact Whether the search should be exact
	 * @returns All groups that are found
	 */
	public findGroups(searchString?: string, exact?: boolean): CommandGroup[]
	/**
	 * Registers a single command
	 * @param command Either a Command instance, or a constructor for one
	 *  @see {@link CommandoRegistry#registerCommands}
	 */
	public registerCommand(command: Command | Function): CommandoRegistry
	/**
	 * Registers multiple commands
	 * @param commands An array of Command instances or constructors
	 * @param ignoreInvalid Whether to skip over invalid objects without throwing an error
	 */
	public registerCommands(commands: Command[] | Function[], ignoreInvalid?: boolean): CommandoRegistry
	/**
	 * Registers all commands in a directory. The files must export a Command class constructor or instance.
	 * @param options The path to the directory, or a require-all options object
	 * @example
	 * const path = require('path')
	 * registry.registerCommandsIn(path.join(__dirname, 'commands'))
	 */
	public registerCommandsIn(options: string | {}): CommandoRegistry
	/**
	 * Registers the default commands to the registry
	 * @param commands Object specifying which commands to register
	 */
	public registerDefaultCommands(commands?: DefaultCommandsOptions): CommandoRegistry
	/** Registers the default groups ("util" and "commands") */
	public registerDefaultGroups(): CommandoRegistry
	/**
	 * Registers the default argument types, groups, and commands. This is equivalent to:
	 * ```js
	 * registry.registerDefaultTypes()
	   * 	.registerDefaultGroups()
	 * 	.registerDefaultCommands()
	 * ```
	 */
	public registerDefaults(): CommandoRegistry
	/**
	 * Registers the default argument types to the registry
	 * @param types Object specifying which types to register
	 */
	public registerDefaultTypes(types?: DefaultTypesOptions): CommandoRegistry
	/**
	 * Registers a single group
	 * @param group A CommandGroup instance, a constructor, or the group id
	 * @param name Name for the group (if the first argument is the group id)
	 * @param guarded Whether the group should be guarded (if the first argument is the group id)
	 *  @see {@link CommandoRegistry#registerGroups}
	 */
	public registerGroup(group: CommandGroup | Function | { id: string, name?: string, guarded?: boolean } | string, name?: string, guarded?: boolean): CommandoRegistry
	/**
	 * Registers multiple groups
	 * @param groups An array of CommandGroup instances, constructors, plain objects
	 * (with id, name, and guarded properties), or arrays of {@link CommandoRegistry#registerGroup} parameters
	 * @example
	 * registry.registerGroups([
	 * 	['fun', 'Fun'],
	 * 	['mod', 'Moderation']
	 * ])
	 * @example
	 * registry.registerGroups([
	 * 	{ id: 'fun', name: 'Fun' },
	 * 	{ id: 'mod', name: 'Moderation' }
	 * ])
	 */
	public registerGroups(groups: CommandGroup[] | Function[] | { id: string, name?: string, guarded?: boolean }[] | string[][]): CommandoRegistry
	/**
	 * Registers a single argument type
	 * @param type Either an ArgumentType instance, or a constructor for one
	 *  @see {@link CommandoRegistry#registerTypes}
	 */
	public registerType(type: ArgumentType | Function): CommandoRegistry
	/**
	 * Registers multiple argument types
	 * @param type An array of ArgumentType instances or constructors
	 * @param ignoreInvalid Whether to skip over invalid objects without throwing an error
	 */
	public registerTypes(type: ArgumentType[] | Function[], ignoreInvalid?: boolean): CommandoRegistry
	/**
	 * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
	 * @param options The path to the directory, or a require-all options object
	 */
	public registerTypesIn(options: string | {}): CommandoRegistry
	/**
	 * Reregisters a command (does not support changing name, group, or memberName)
	 * @param command New command
	 * @param oldCommand Old command
	 */
	public reregisterCommand(command: Command | Function, oldCommand: Command): void
	/**
	 * Resolves a CommandResolvable to a Command object
	 * @param command The command to resolve
	 * @returns The resolved Command
	 */
	public resolveCommand(command: CommandResolvable): Command
	/**
	 * Resolves a command file path from a command's group id and memberName
	 * @param group id of the command's group
	 * @param memberName Member name of the command
	 * @returns Fully-resolved path to the corresponding command file
	 */
	public resolveCommandPath(group: string, memberName: string): string
	/**
	 * Resolves a CommandGroupResolvable to a CommandGroup object
	 * @param group The group to resolve
	 * @returns The resolved CommandGroup
	 */
	public resolveGroup(group: CommandGroupResolvable): CommandGroup
	/**
	 * Unregisters a command
	 * @param command Command to unregister
	 */
	public unregisterCommand(command: Command): void
}

/** Has a message that can be considered user-friendly */
export class FriendlyError extends Error {
	/**
	 * @param message The error message
	 */
	public constructor(message: string)
}

/** Helper class to use {@link SettingProvider} methods for a specific Guild */
export class GuildSettingsHelper {
	/**
	 * @param client Client to use the provider of
	 * @param guild Guild the settings are for
	 */
	public constructor(client: CommandoClient, guild: CommandoGuild)

	/** Client to use the provider of */
	public readonly client: CommandoClient
	/** Guild the settings are for */
	public guild: CommandoGuild

	/**
	 * Removes all settings in the guild
	 *  @see {@link SettingProvider#clear}
	 */
	public clear(): Promise<void>
	/**
	 * Gets a setting in the guild
	 * @param key Name of the setting
	 * @param defVal Value to default to if the setting isn't set
	 *  @see {@link SettingProvider#get}
	 */
	public get(key: string, defVal?: any): any
	/**
	 * Removes a setting from the guild
	 * @param key Name of the setting
	 * @returns Old value of the setting
	 *  @see {@link SettingProvider#remove}
	 */
	public remove(key: string): Promise<any>
	/**
	 * Sets a setting for the guild
	 * @param key Name of the setting
	 * @param val Value of the setting
	 * @returns New value of the setting
	 *  @see {@link SettingProvider#set}
	 */
	public set(key: string, val: any): Promise<any>
}

/** Loads and stores settings associated with guilds */
export abstract class SettingProvider {
	/**
	 * Removes all settings in a guild
	 * @param guild Guild to clear the settings of
	 */
	public abstract clear(guild: Guild | string): Promise<void>
	/** Destroys the provider, removing any event listeners. */
	public abstract destroy(): Promise<void>
	/**
	 * Obtains a setting for a guild
	 * @param guild Guild the setting is associated with (or 'global')
	 * @param key Name of the setting
	 * @param defVal Value to default to if the setting isn't set on the guild
	 */
	public abstract get(guild: Guild | string, key: string, defVal?: any): any
	/**
	 * Initialises the provider by connecting to databases and/or caching all data in memory.
	 * {@link CommandoClient#setProvider} will automatically call this once the client is ready.
	 * @param client Client that will be using the provider
	 */
	public abstract init(client: CommandoClient): Promise<void>
	/**
	 * Removes a setting from a guild
	 * @param guild Guild the setting is associated with (or 'global')
	 * @param key Name of the setting
	 * @returns Old value of the setting
	 */
	public abstract remove(guild: Guild | string, key: string): Promise<any>
	/**
	 * Sets a setting for a guild
	 * @param guild Guild to associate the setting with (or 'global')
	 * @param key Name of the setting
	 * @param val Value of the setting
	 * @returns New value of the setting
	 */
	public abstract set(guild: Guild | string, key: string, val: any): Promise<any>

	/**
	 * Obtains the id of the provided guild, or throws an error if it isn't valid
	 * @param guild Guild to get the id of
	 * @returns id of the guild, or 'global'
	 */
	public static getGuildId(guild: Guild | string): string
}

/** Uses an SQLite database to store settings with guilds */
export class SQLiteProvider extends SettingProvider {
	/**
	 * @param db Database for the provider
	 */
	public constructor(db: any | Promise<any>)

	/** Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider}) */
	public readonly client: CommandoClient
	/** Database that will be used for storing/retrieving settings */
	public db: any
	/** Prepared statement to delete an entire settings row */
	private deleteStmt: any
	/** Prepared statement to insert or replace a settings row */
	private insertOrReplaceStmt: any
	/** Listeners on the Client, mapped by the event name */
	private listeners: Map<any, any>
	/** Settings cached in memory, mapped by guild id (or 'global') */
	private settings: Map<any, any>

	/**
	 * Removes all settings in a guild
	 * @param guild Guild to clear the settings of
	 */
	public clear(guild: Guild | string): Promise<void>
	/** Destroys the provider, removing any event listeners. */
	public destroy(): Promise<void>
	/**
	 * Obtains a setting for a guild
	 * @param guild Guild the setting is associated with (or 'global')
	 * @param key Name of the setting
	 * @param defVal Value to default to if the setting isn't set on the guild
	 */
	public get(guild: Guild | string, key: string, defVal?: any): any
	/**
	 * Initialises the provider by connecting to databases and/or caching all data in memory.
	 * {@link CommandoClient#setProvider} will automatically call this once the client is ready.
	 * @param client Client that will be using the provider
	 */
	public init(client: CommandoClient): Promise<void>
	/**
	 * Removes a setting from a guild
	 * @param guild Guild the setting is associated with (or 'global')
	 * @param key Name of the setting
	 * @returns Old value of the setting
	 */
	public remove(guild: Guild | string, key: string): Promise<any>
	/**
	 * Sets a setting for a guild
	 * @param guild Guild to associate the setting with (or 'global')
	 * @param key Name of the setting
	 * @param val Value of the setting
	 * @returns New value of the setting
	 */
	public set(guild: Guild | string, key: string, val: any): Promise<any>
	/**
	 * Loads all settings for a guild
	 * @param guild Guild id to load the settings of (or 'global')
	 * @param settings Settings to load
	 */
	private setupGuild(guild: string, settings: {}): void
	/**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param guild Guild to set the status in
	 * @param command Command to set the status of
	 * @param settings Settings of the guild
	 */
	private setupGuildCommand(guild: CommandoGuild, command: Command, settings: {}): void
	/**
	 * Sets up a command group's status in a guild from the guild's settings
	 * @param guild Guild to set the status in
	 * @param group Group to set the status of
	 * @param settings Settings of the guild
	 */
	private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: {}): void
	/**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param key Key of the setting to update
	 * @param val Value of the setting
	 */
	private updateOtherShards(key: string, val: any): void
}

/** Uses an SQLite database to store settings with guilds */
export class SyncSQLiteProvider extends SettingProvider {
	/**
	 * @param db Database Connection for the provider
	 */
	public constructor(db: any | Promise<any>)

	/** Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider}) */
	public readonly client: CommandoClient
	/** Database that will be used for storing/retrieving settings */
	public db: any
	/** Prepared statement to delete an entire settings row */
	private deleteStmt: any
	/** Prepared statement to insert or replace a settings row */
	private insertOrReplaceStmt: any
	/** Listeners on the Client, mapped by the event name */
	private listeners: Map<any, any>
	/** Settings cached in memory, mapped by guild id (or 'global') */
	private settings: Map<any, any>

	/**
	 * Removes all settings in a guild
	 * @param guild Guild to clear the settings of
	 */
	public clear(guild: Guild | string): Promise<void>
	/** Destroys the provider, removing any event listeners. */
	public destroy(): Promise<void>
	/**
	 * Obtains a setting for a guild
	 * @param guild Guild the setting is associated with (or 'global')
	 * @param key Name of the setting
	 * @param defVal Value to default to if the setting isn't set on the guild
	 */
	public get(guild: Guild | string, key: string, defVal?: any): any
	/**
	 * Initialises the provider by connecting to databases and/or caching all data in memory.
	 * {@link CommandoClient#setProvider} will automatically call this once the client is ready.
	 * @param client Client that will be using the provider
	 */
	public init(client: CommandoClient): Promise<void>
	/**
	 * Removes a setting from a guild
	 * @param guild Guild the setting is associated with (or 'global')
	 * @param key Name of the setting
	 * @returns Old value of the setting
	 */
	public remove(guild: Guild | string, key: string): Promise<any>
	/**
	 * Sets a setting for a guild
	 * @param guild Guild to associate the setting with (or 'global')
	 * @param key Name of the setting
	 * @param val Value of the setting
	 * @returns New value of the setting
	 */
	public set(guild: Guild | string, key: string, val: any): Promise<any>
	/**
	 * Loads all settings for a guild
	 * @param guild Guild id to load the settings of (or 'global')
	 * @param settings Settings to load
	 */
	private setupGuild(guild: string, settings: {}): void
	/**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param guild Guild to set the status in
	 * @param command Command to set the status of
	 * @param settings Settings of the guild
	 */
	private setupGuildCommand(guild: CommandoGuild, command: Command, settings: {}): void
	/**
	 * Sets up a command group's status in a guild from the guild's settings
	 * @param guild Guild to set the status in
	 * @param group Group to set the status of
	 * @param settings Settings of the guild
	 */
	private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: {}): void
	/**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param key Key of the setting to update
	 * @param val Value of the setting
	 */
	private updateOtherShards(key: string, val: any): void
}

export class util {
	public static disambiguation(items: any[], label: string, property?: string): string
	public static escapeRegex(str: string): string
	public static paginate<T>(items: T[], page?: number, pageLength?: number): {
		items: T[],
		page: number,
		maxPage: number,
		pageLength: number
	}
	public static readonly permissions: { [K in PermissionString]: string }
}

/** The version of Discord.js Commando */
export const version: string

/** Result object from obtaining argument values from an {@link ArgumentCollector} */
export interface ArgumentCollectorResult<T = object> {
	/** Final values for the arguments, mapped by their keys */
	values: T | null
	/**
	 * One of:
	 * - `user` (user cancelled)
	 * - `time` (wait time exceeded)
	 * - `promptLimit` (prompt limit exceeded)
	 */
	cancelled?: 'user' | 'time' | 'promptLimit'
	/** All messages that were sent to prompt the user */
	prompts: Message[]
	/** All of the user's messages that answered a prompt */
	answers: Message[]
}

/** Either a value or a function that returns a value. The function is passed the CommandoMessage and the Argument. */
export type ArgumentDefault = any | Function

/** Information for the command argument */
export interface ArgumentInfo {
	/** Key for the argument */
	key: string
	/**
	 * Label for the argument
	 * @default this.key
	 */
	label?: string
	/** First prompt for the argument when it wasn't specified */
	prompt: string
	/** Predefined error message to output for the argument when it isn't valid */
	error?: string
	/**
	 * Type of the argument (must be the id of one of the registered argument
	 * types or multiple ids in order of priority separated by `|` for a union type -
	 * see {@link CommandoRegistry#registerDefaultTypes} for the built-in types) */
	type?: ArgumentTypes | ArgumentTypes[]
	/**
	 * If type is `integer` or `float`, this is the maximum value of the number.
	 * If type is `string`, this is the maximum length of the string.
	 */
	max?: number
	/**
	 * If type is `integer` or `float`, this is the minimum value of the number.
	 * If type is `string`, this is the minimum length of the string.
	 */
	min?: number
	/** Default value for the argument (makes the arg optional - cannot be `null`) */
	oneOf?: string[]
	/**
	 * Whether the argument is required or not
	 * @default true
	 */
	required?: boolean
	/** An array of values that are allowed to be used */
	default?: ArgumentDefault
	/**
	 * Whether the argument accepts infinite values
	 * @default false
	 */
	infinite?: boolean
	/** Validator function for the argument (see {@link ArgumentType#validate}) */
	validate?: (val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage) => any
	/** Parser function for the argument (see {@link ArgumentType#parse}) */
	parse?: (val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage) => any
	/** Empty checker for the argument (see {@link ArgumentType#isEmpty}) */
	isEmpty?: (val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage) => any
	/**
	 * How long to wait for input (in seconds)
	 * @default 30
	 */
	wait?: number
}

/** Result object from obtaining a single {@link Argument}'s value(s) */
export interface ArgumentResult {
	/** Final value(s) for the argument */
	value: any | any[]
	/**
	 * One of:
	 * - `user` (user cancelled)
	 * - `time` (wait time exceeded)
	 * - `promptLimit` (prompt limit exceeded)
	 */
	cancelled?: 'user' | 'time' | 'promptLimit'
	/** All messages that were sent to prompt the user */
	prompts: Message[]
	/** All of the user's messages that answered a prompt */
	answers: Message[]
}

export type ArgumentTypes = 'string' | 'integer' | 'float' | 'boolean' | 'duration' | 'date' | 'timestamp' |
	'user' | 'member' | 'role' | 'channel' | 'text-channel' | 'thread-channel' | 'voice-channel' | 'stage-channel' |
	'category-channel' | 'message' | 'invite' | 'custom-emoji' | 'default-emoji' | 'command' | 'group'

export class ClientGuildMember extends GuildMember {
	/** The client this member is for */
	client: CommandoClient
	/** The user this client member is for */
	user: ClientUser
}

/**
 * A CommandGroupResolvable can be:
 * - A {@link CommandGroup}
 * - A group id
 */
export type CommandGroupResolvable = CommandGroup | string

/** The command information */
export interface CommandInfo {
	/** The name of the command (must be lowercase) */
	name: string
	/** Alternative names for the command (all must be lowercase) */
	aliases?: string[]
	/**
	 * Whether automatic aliases should be added
	 * @default true
	 */
	autoAliases?: boolean
	/** The id of the group the command belongs to (must be lowercase) */
	group: string
	/**
	 * The member name of the command in the group (must be lowercase)
	 * @default this.name
	 */
	memberName: string
	/** A short description of the command */
	description: string
	/** The command usage format string - will be automatically generated if not specified, and `args` is specified */
	format?: string
	/** A detailed description of the command and its functionality */
	details?: string
	/** Usage examples of the command */
	examples?: string[]
	/**
	 * Whether the command is usable only in NSFW channels.
	 * @default false
	 */
	nsfw?: boolean
	/**
	 * Whether or not the command should only function in direct messages
	 * @default false
	 */
	dmOnly?: boolean
	/**
	 * Whether or not the command should only function in a guild channel
	 * @default false
	 */
	guildOnly?: boolean
	/**
	 * Whether or not the command is usable only by a server owner
	 * @default false
	 */
	serverOwnerOnly?: boolean
	/**
	 * Whether or not the command is usable only by an owner
	 * @default false
	 */
	ownerOnly?: boolean
	/** Permissions required by the client to use the command. */
	clientPermissions?: PermissionResolvable[]
	/** Permissions required by the user to use the command. */
	userPermissions?: PermissionResolvable[]
	/**
	 * Whether or not the default command handling should be used. If false, then only patterns will trigger the command.
	 * @default true
	 */
	defaultHandling?: boolean
	/** Options for throttling usages of the command. */
	throttling?: ThrottlingOptions
	/** Arguments for the command */
	args?: ArgumentInfo[]
	/**
	 * Maximum number of times to prompt a user for a single argument. Only applicable if `args` is specified.
	 * @default Infinity
	 */
	argsPromptLimit?: number
	/**
	 * One of 'single' or 'multiple'. Only applicable if `args` is not specified.
	 * When 'single', the entire argument string will be passed to run as one argument.
	 * When 'multiple', it will be passed as multiple arguments.
	 * @default 'single'
	 */
	argsType?: string
	/**
	 * The number of arguments to parse from the command string. Only applicable when argsType is 'multiple'.
	 * If nonzero, it should be at least 2. When this is 0, the command argument string will be split into as
	 * many arguments as it can be. When nonzero, it will be split into a maximum of this number of arguments.
	 * @default 0
	 */
	argsCount?: number
	/**
	 * Whether or not single quotes should be allowed to box-in arguments in the command string.
	 * @default true
	 */
	argsSingleQuotes?: boolean
	/** Patterns to use for triggering the command */
	patterns?: RegExp[]
	/**
	 * Whether the command should be protected from disabling
	 * @default false
	 */
	guarded?: boolean
	/**
	 * Whether the command should be protected from disabling
	 * @default false
	 */
	hidden?: boolean
	/**
	 * Whether the command should be run when an unknown command is used -
	 * there may only be one command registered with this property as `true`.
	 * @default false
	 */
	unknown?: boolean
}

export interface CommandoClientEvents extends ClientEvents {
	commandBlock: [message: CommandoMessage, reason: CommandBlockReason, data?: CommandBlockData]
	commandCancel: [command: Command, reason: string, message: CommandoMessage, result?: ArgumentCollectorResult]
	commandError: [
		command: Command, error: Error, message: CommandoMessage, args: object | string | string[],
		fromPattern: boolean, result?: ArgumentCollectorResult
	]
	commandPrefixChange: [guild?: CommandoGuild, prefix?: string]
	commandRegister: [command: Command, registry: CommandoRegistry]
	commandReregister: [newCommand: Command, oldCommand: Command]
	commandRun: [
		command: Command, promise: Promise<any>, message: CommandoMessage,
		args: object | string | string[], fromPattern: boolean, result?: ArgumentCollectorResult
	]
	commandStatusChange: [guild?: CommandoGuild, command: Command, enabled: boolean]
	commandUnregister: [command: Command]
	cMessageCreate: [message: CommandoMessage]
	cMessageUpdate: [oldMessage: Message, newMessage: CommandoMessage]
	groupRegister: [group: CommandGroup, registry: CommandoRegistry]
	groupStatusChange: [guild?: CommandoGuild, group: CommandGroup, enabled: boolean]
	guildMemberMute: [guild: CommandoGuild, moderator: User, user: User, reason: string, duration: number]
	guildMemberUnmute: [guild: CommandoGuild, moderator?: User, user: User, reason: string, expired?: boolean]
	providerReady: [provider: SettingProvider]
	typeRegister: [type: ArgumentType, registry: CommandoRegistry]
	unknownCommand: [message: CommandoMessage]
}

/** Options for a CommandoClient */
export interface CommandoClientOptions extends ClientOptions {
	/**
	 * Default command prefix
	 * @default '!'
	 */
	prefix?: string
	/**
	 * Time in seconds that command messages should be editable
	 * @default 30
	 */
	commandEditableDuration?: number
	/**
	 * Whether messages without commands can be edited to a command
	 * @default true
	 */
	nonCommandEditable?: boolean
	/** id of the bot owner's Discord user, or multiple ids */
	owner?: string | string[] | Set<string>
	/** Invite URL to the bot's support server */
	serverInvite?: string
	/** Invite options for the bot */
	inviteOptions?: InviteGenerationOptions | string
}

/** Additional data associated with the block */
export type CommandBlockData = {
	/**
	 * Built-in reason: `throttling`
	 * - The throttle object
	 */
	throttle?: Throttle
	/**
	 * Built-in reason: `throttling`
	 * - Remaining time in seconds
	 */
	remaining?: number
	/**
	 * Built-in reasons: `userPermissions` & `clientPermissions`
	 * - Missing permissions names
	 */
	missing?: PermissionString[]
}

/** The reason of {@link Command#onBlock} */
export type CommandBlockReason =
	'guildOnly' |
	'nsfw' |
	'dmOnly' |
	'serverOwnerOnly' |
	'ownerOnly' |
	'userPermissions' |
	'clientPermissions' |
	'throttling'

/**
 * A CommandResolvable can be:
 * - A {@link Command}
 * - A command name
 * - A {@link CommandoMessage}
 */
export type CommandResolvable = Command | string

/** Object specifying which commands to register */
export interface DefaultCommandsOptions {
	/**
	 * Whether to register the built-in unknown command
	 * @default true
	 */
	unknown?: boolean
	/**
	 * Whether to register the built-in command state commands (load, unload, reload)
	 * @default true
	 */
	commandState?: boolean
}

/** Object specifying which types to register */
export interface DefaultTypesOptions {
	/**
	 * Whether to register the built-in string type
	 * @default true
	 */
	string?: boolean
	/**
	 * Whether to register the built-in integer type
	 * @default true
	 */
	integer?: boolean
	/**
	 * Whether to register the built-in float type
	 * @default true
	 */
	float?: boolean
	/**
	 * Whether to register the built-in boolean type
	 * @default true
	 */
	boolean?: boolean
	/**
	 * Whether to register the built-in duration type
	 * @default true
	 */
	 duration?: boolean
	/**
	 * Whether to register the built-in date type
	 * @default true
	 */
	date?: boolean
	/**
	 * Whether to register the built-in timestamp type
	 * @default true
	 */
	timestamp?: boolean
	/**
	 * Whether to register the built-in user type
	 * @default true
	 */
	user?: boolean
	/**
	 * Whether to register the built-in member type
	 * @default true
	 */
	member?: boolean
	/**
	 * Whether to register the built-in role type
	 * @default true
	 */
	role?: boolean
	/**
	 * Whether to register the built-in channel type
	 * @default true
	 */
	channel?: boolean
	/**
	 * Whether to register the built-in text-channel type
	 * @default true
	 */
	textChannel?: boolean
	/**
	 * Whether to register the built-in thread-channel type
	 * @default true
	 */
	threadChannel?: boolean
	/**
	 * Whether to register the built-in voice-channel type
	 * @default true
	 */
	voiceChannel?: boolean
	/**
	 * Whether to register the built-in stage-channel type
	 * @default true
	 */
	stageChannel?: boolean
	/**
	 * Whether to register the built-in category-channel type
	 * @default true
	 */
	categoryChannel?: boolean
	/**
	 * Whether to register the built-in message type
	 * @default true
	 */
	message?: boolean
	/**
	 * Whether to register the built-in invite type
	 * @default true
	 */
	invite?: boolean
	/**
	 * Whether to register the built-in custom-emoji type
	 * @default true
	 */
	customEmoji?: boolean
	/**
	 * Whether to register the built-in default-emoji type
	 * @default true
	 */
	defaultEmoji?: boolean
	/**
	 * Whether to register the built-in command type
	 * @default true
	 */
	command?: boolean
	/**
	 * Whether to register the built-in group type
	 * @default true
	 */
	group?: boolean
}

/**
 * A function that decides whether the usage of a command should be blocked
 * @param msg Message triggering the command
 */
export type Inhibitor = (msg: CommandoMessage) => false | string | Inhibition

export interface Inhibition {
	/** Identifier for the reason the command is being blocked */
	reason: string
	/** Response being sent to the user */
	response?: Promise<Message>
}

/** Throttling object of the command. */
export interface Throttle {
	/** Time when the throttle started */
	start: number
	/** Amount usages of the command */
	usages: number
	/** Timeout function for this throttle */
	timeout: NodeJS.Timeout
}

/** Options for throttling usages of the command. */
export interface ThrottlingOptions {
	/** Maximum number of usages of the command allowed in the time frame */
	usages: number
	/** Amount of time to count the usages of the command within (in seconds) */
	duration: number
}

export type ResponseType = 'reply' | 'plain' | 'direct' | 'code'

export interface RespondOptions {
	content: StringResolvable | MessageOptions
	fromEdit?: boolean
	options?: MessageOptions
	lang?: string
	type?: ResponseType
}

export interface RespondEditOptions {
	content: StringResolvable | MessageEditOptions | Exclude<MessageAdditions, MessageAttachment>
	options?: MessageEditOptions | Exclude<MessageAdditions, MessageAttachment>
	type?: ResponseType
}

export type StringResolvable = string | string[] | object