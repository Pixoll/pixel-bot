const path = require('path')
const { Collection } = require('discord.js')
const Command = require('./commands/base')
const CommandGroup = require('./commands/group')
const CommandoMessage = require('./extensions/message')
const ArgumentType = require('./types/base')
const { isConstructor } = require('./util')
const { CommandoClient, DefaultCommandsOptions, DefaultTypesOptions, CommandGroupResolvable, CommandResolvable } = require('./typings')

/** Handles registration and searching of commands and groups */
class CommandoRegistry {
	/** @param {CommandoClient} [client] Client to use  */
	constructor(client) {
		/**
		 * The client this registry is for
		 * @type {CommandoClient}
		 * @readonly
		 */
		this.client = client

		/**
		 * Registered commands, mapped by their name
		 * @type {Collection<string, Command>}
		 */
		this.commands = new Collection()

		/**
		 * Registered command groups, mapped by their id
		 * @type {Collection<string, CommandGroup>}
		 */
		this.groups = new Collection()

		/**
		 * Registered argument types, mapped by their id
		 * @type {Collection<string, ArgumentType>}
		 */
		this.types = new Collection()

		/**
		 * Fully resolved path to the bot's commands directory
		 * @type {?string}
		 */
		this.commandsPath = null

		/**
		 * Command to run when an unknown command is used
		 * @type {?Command}
		 */
		this.unknownCommand = null
	}

	/**
	 * Registers a single group
	 * @param {CommandGroup|Function|Object|string} group A CommandGroup instance, a constructor, or the group id
	 * @param {string} [name] Name for the group (if the first argument is the group id)
	 * @param {boolean} [guarded] Whether the group should be guarded (if the first argument is the group id)
	 * @return {CommandoRegistry}
	 * @see {@link CommandoRegistry#registerGroups}
	 */
	registerGroup(group, name, guarded) {
		if (typeof group === 'string') {
			group = new CommandGroup(this.client, group, name, guarded)
		} else if (isConstructor(group, CommandGroup)) {
			group = new group(this.client) // eslint-disable-line new-cap
		} else if (typeof group === 'object' && !(group instanceof CommandGroup)) {
			group = new CommandGroup(this.client, group.id, group.name, group.guarded)
		}

		const existing = this.groups.get(group.id)
		if (existing) {
			existing.name = group.name
			this.client.emit('debug', `Group ${group.id} is already registered renamed it to "${group.name}".`)
		} else {
			this.groups.set(group.id, group)
			this.client.emit('groupRegister', group, this)
			this.client.emit('debug', `Registered group ${group.id}.`)
		}

		return this
	}

	/**
	 * Registers multiple groups
	 * @param {CommandGroup[]|Function[]|Object[]|Array<string[]>} groups An array of CommandGroup instances,
	 * constructors, plain objects (with id, name, and guarded properties),
	 * or arrays of {@link CommandoRegistry#registerGroup} parameters
	 * @return {CommandoRegistry}
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
	registerGroups(groups) {
		if (!Array.isArray(groups)) throw new TypeError('Groups must be an Array.')
		for (const group of groups) {
			if (Array.isArray(group)) this.registerGroup(...group)
			else this.registerGroup(group)
		}
		return this
	}

	/**
	 * Registers a single command
	 * @param {Command|Function} command Either a Command instance, or a constructor for one
	 * @return {CommandoRegistry}
	 * @see {@link CommandoRegistry#registerCommands}
	 */
	registerCommand(command) {
		/* eslint-disable new-cap */
		if (isConstructor(command, Command)) command = new command(this.client)
		else if (isConstructor(command.default, Command)) command = new command.default(this.client)
		/* eslint-enable new-cap */
		if (!(command instanceof Command)) throw new Error(`Invalid command object to register: ${command}`)

		// Make sure there aren't any conflicts
		if (this.commands.some(cmd => cmd.name === command.name || cmd.aliases.includes(command.name))) {
			throw new Error(`A command with the name/alias "${command.name}" is already registered.`)
		}
		for (const alias of command.aliases) {
			if (this.commands.some(cmd => cmd.name === alias || cmd.aliases.includes(alias))) {
				throw new Error(`A command with the name/alias "${alias}" is already registered.`)
			}
		}
		const group = this.groups.find(grp => grp.id === command.groupId)
		if (!group) throw new Error(`Group "${command.groupId}" is not registered.`)
		if (group.commands.some(cmd => cmd.memberName === command.memberName)) {
			throw new Error(`A command with the member name "${command.memberName}" is already registered in ${group.id}`)
		}
		if (command.unknown && this.unknownCommand) throw new Error('An unknown command is already registered.')

		// Add the command
		command.group = group
		group.commands.set(command.name, command)
		this.commands.set(command.name, command)
		if (command.unknown) this.unknownCommand = command

		this.client.emit('commandRegister', command, this)
		this.client.emit('debug', `Registered command ${group.id}:${command.memberName}.`)

		return this
	}

	/**
	 * Registers multiple commands
	 * @param {Command[]|Function[]} commands An array of Command instances or constructors
	 * @param {boolean} [ignoreInvalid=false] Whether to skip over invalid objects without throwing an error
	 * @return {CommandoRegistry}
	 */
	registerCommands(commands, ignoreInvalid = false) {
		if (!Array.isArray(commands)) throw new TypeError('Commands must be an Array.')
		for (const command of commands) {
			const valid = isConstructor(command, Command) || isConstructor(command.default, Command) ||
				command instanceof Command || command.default instanceof Command
			if (ignoreInvalid && !valid) {
				this.client.emit('warn', `Attempting to register an invalid command object: ${command} skipping.`)
				continue
			}
			this.registerCommand(command)
		}
		return this
	}

	/**
	 * Registers all commands in a directory. The files must export a Command class constructor or instance.
	 * @param {string|RequireAllOptions} options The path to the directory, or a require-all options object
	 * @return {CommandoRegistry}
	 * @example
	 * const path = require('path')
	 * registry.registerCommandsIn(path.join(__dirname, 'commands'))
	 */
	registerCommandsIn(options) {
		const obj = require('require-all')(options)
		const commands = []
		for (const group of Object.values(obj)) {
			for (let command of Object.values(group)) {
				if (typeof command.default === 'function') command = command.default
				commands.push(command)
			}
		}
		if (typeof options === 'string' && !this.commandsPath) this.commandsPath = options
		else if (typeof options === 'object' && !this.commandsPath) this.commandsPath = options.dirname
		return this.registerCommands(commands, true)
	}

	/**
	 * Registers a single argument type
	 * @param {ArgumentType|Function} type Either an ArgumentType instance, or a constructor for one
	 * @return {CommandoRegistry}
	 * @see {@link CommandoRegistry#registerTypes}
	 */
	registerType(type) {
		/* eslint-disable new-cap */
		if (isConstructor(type, ArgumentType)) type = new type(this.client)
		else if (isConstructor(type.default, ArgumentType)) type = new type.default(this.client)
		/* eslint-enable new-cap */

		if (!(type instanceof ArgumentType)) throw new Error(`Invalid type object to register: ${type}`)

		// Make sure there aren't any conflicts
		if (this.types.has(type.id)) throw new Error(`An argument type with the id "${type.id}" is already registered.`)

		// Add the type
		this.types.set(type.id, type)

		this.client.emit('typeRegister', type, this)
		this.client.emit('debug', `Registered argument type ${type.id}.`)

		return this
	}

	/**
	 * Registers multiple argument types
	 * @param {ArgumentType[]|Function[]} types An array of ArgumentType instances or constructors
	 * @param {boolean} [ignoreInvalid=false] Whether to skip over invalid objects without throwing an error
	 * @return {CommandoRegistry}
	 */
	registerTypes(types, ignoreInvalid = false) {
		if (!Array.isArray(types)) throw new TypeError('Types must be an Array.')
		for (const type of types) {
			const valid = isConstructor(type, ArgumentType) || isConstructor(type.default, ArgumentType) || type instanceof ArgumentType || type.default instanceof ArgumentType
			if (ignoreInvalid && !valid) {
				this.client.emit('warn', `Attempting to register an invalid argument type object: ${type} skipping.`)
				continue
			}
			this.registerType(type)
		}
		return this
	}

	/**
	 * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
	 * @param {string|RequireAllOptions} options The path to the directory, or a require-all options object
	 * @return {CommandoRegistry}
	 */
	registerTypesIn(options) {
		const obj = require('require-all')(options)
		const types = []
		for (const type of Object.values(obj)) types.push(type)
		return this.registerTypes(types, true)
	}

	/**
	 * Registers the default argument types, groups, and commands. This is equivalent to:
	 * ```js
	 * registry.registerDefaultTypes()
	 * 	.registerDefaultGroups()
	 * 	.registerDefaultCommands()
	 * ```
	 * @return {CommandoRegistry}
	 */
	registerDefaults() {
		this.registerDefaultTypes()
		this.registerDefaultGroups()
		this.registerDefaultCommands()
		return this
	}

	/**
	 * Registers the default groups ("util" and "commands")
	 * @return {CommandoRegistry}
	 */
	registerDefaultGroups() {
		return this.registerGroups([
			['commands', 'Commands', true],
			['util', 'Utility']
		])
	}

	/**
	 * Registers the default commands to the registry
	 * @param {DefaultCommandsOptions} [commands] Object specifying which commands to register
	 * @return {CommandoRegistry}
	 */
	registerDefaultCommands(commands = {}) {
		commands = {
			unknown: true, commandState: true, ...commands
		}
		if (commands.unknown) this.registerCommand(require('./commands/util/unknown-command'))
		if (commands.commandState) {
			this.registerCommands([
				require('./commands/commands/reload'),
				require('./commands/commands/load'),
				require('./commands/commands/unload')
			])
		}
		return this
	}

	/**
	 * Registers the default argument types to the registry
	 * @param {DefaultTypesOptions} [types] Object specifying which types to register
	 * @return {CommandoRegistry}
	 */
	registerDefaultTypes(types = {}) {
		types = {
			string: true, integer: true, float: true, boolean: true, duration: true, date: true, user: true,
			member: true, role: true, channel: true, textChannel: true, threadChannel: true, voiceChannel: true,
			stageChannel: true, categoryChannel: true, message: true, invite: true, customEmoji: true,
			defaultEmoji: true, command: true, group: true, ...types
		}

		for (let type in types) {
			if (type !== type.toLowerCase()) {
				type = type.replace(/[A-Z]/g, '-$&').toLowerCase()
			}

			this.registerType(require(`./types/${type}`))
		}

		return this
	}

	/**
	 * Reregisters a command (does not support changing name, group, or memberName)
	 * @param {Command|Function} command New command
	 * @param {Command} oldCommand Old command
	 */
	reregisterCommand(command, oldCommand) {
		/* eslint-disable new-cap */
		if (isConstructor(command, Command)) command = new command(this.client)
		else if (isConstructor(command.default, Command)) command = new command.default(this.client)
		/* eslint-enable new-cap */

		if (command.name !== oldCommand.name) throw new Error('Command name cannot change.')
		if (command.groupId !== oldCommand.groupId) throw new Error('Command group cannot change.')
		if (command.memberName !== oldCommand.memberName) throw new Error('Command memberName cannot change.')
		if (command.unknown && this.unknownCommand !== oldCommand) {
			throw new Error('An unknown command is already registered.')
		}

		command.group = this.resolveGroup(command.groupId)
		command.group.commands.set(command.name, command)
		this.commands.set(command.name, command)
		if (this.unknownCommand === oldCommand) this.unknownCommand = null
		if (command.unknown) this.unknownCommand = command

		this.client.emit('commandReregister', command, oldCommand)
		this.client.emit('debug', `Reregistered command ${command.groupId}:${command.memberName}.`)
	}

	/**
	 * Unregisters a command
	 * @param {Command} command Command to unregister
	 */
	unregisterCommand(command) {
		this.commands.delete(command.name)
		command.group.commands.delete(command.name)
		if (this.unknownCommand === command) this.unknownCommand = null

		this.client.emit('commandUnregister', command)
		this.client.emit('debug', `Unregistered command ${command.groupId}:${command.memberName}.`)
	}

	/**
	 * Finds all groups that match the search string
	 * @param {string} [searchString] The string to search for
	 * @param {boolean} [exact=false] Whether the search should be exact
	 * @return {CommandGroup[]} All groups that are found
	 */
	findGroups(searchString = null, exact = false) {
		if (!searchString) return this.groups

		// Find all matches
		const lcSearch = searchString.toLowerCase()
		const matchedGroups = Array.from(this.groups.filter(
			exact ? groupFilterExact(lcSearch) : groupFilterInexact(lcSearch)
		).values())
		if (exact) return matchedGroups

		// See if there's an exact match
		for (const group of matchedGroups) {
			if (group.name.toLowerCase() === lcSearch || group.id === lcSearch) return [group]
		}
		return matchedGroups
	}

	/**
	 * Resolves a CommandGroupResolvable to a CommandGroup object
	 * @param {CommandGroupResolvable} group The group to resolve
	 * @return {CommandGroup} The resolved CommandGroup
	 */
	resolveGroup(group) {
		if (group instanceof CommandGroup) return group
		if (typeof group === 'string') {
			const groups = this.findGroups(group, true)
			if (groups.length === 1) return groups[0]
		}
		throw new Error('Unable to resolve group.')
	}

	/**
	 * Finds all commands that match the search string
	 * @param {string} [searchString] The string to search for
	 * @param {boolean} [exact=false] Whether the search should be exact
	 * @param {Message} [message] The message to check usability against
	 * @return {Command[]} All commands that are found
	 */
	findCommands(searchString = null, exact = false, message = null) {
		if (!searchString) {
			return message ?
				Array.from(this.commands.filter(cmd => cmd.isUsable(message)).values()) :
				Array.from(this.commands)
		}

		// Find all matches
		const lcSearch = searchString.toLowerCase()
		const matchedCommands = Array.from(this.commands.filter(
			exact ? commandFilterExact(lcSearch) : commandFilterInexact(lcSearch)
		).values())
		if (exact) return matchedCommands

		// See if there's an exact match
		for (const command of matchedCommands) {
			if (command.name === lcSearch || command.aliases?.some(ali => ali === lcSearch)) {
				return [command]
			}
		}

		return matchedCommands
	}

	/**
	 * Resolves a CommandResolvable to a Command object
	 * @param {CommandResolvable} command The command to resolve
	 * @return {Command} The resolved Command
	 */
	resolveCommand(command) {
		if (command instanceof Command) return command
		if (command instanceof CommandoMessage && command.command) return command.command
		if (typeof command === 'string') {
			const commands = this.findCommands(command, true)
			if (commands.length === 1) return commands[0]
		}
		throw new Error('Unable to resolve command.')
	}

	/**
	 * Resolves a command file path from a command's group id and memberName
	 * @param {string} group Id of the command's group
	 * @param {string} memberName Member name of the command
	 * @return {string} Fully-resolved path to the corresponding command file
	 */
	resolveCommandPath(group, memberName) {
		return path.join(this.commandsPath, group, `${memberName}.js`)
	}
}

/** @param {string} search */
function groupFilterExact(search) {
	return /** @param {CommandGroup} grp */ grp =>
		grp.id === search || grp.name.toLowerCase() === search
}

/** @param {string} search */
function groupFilterInexact(search) {
	return /** @param {CommandGroup} grp */ grp =>
		grp.id.includes(search) || grp.name.toLowerCase().includes(search)
}

/** @param {string} search */
function commandFilterExact(search) {
	return /** @param {Command} cmd */ cmd =>
		cmd.name === search ||
		cmd.aliases?.some(ali => ali === search) ||
		`${cmd.groupId}:${cmd.memberName}` === search
}

/** @param {string} search */
function commandFilterInexact(search) {
	return /** @param {Command} cmd */ cmd =>
		cmd.name.includes(search) ||
		`${cmd.groupId}:${cmd.memberName}` === search ||
		cmd.aliases?.some(ali => ali.includes(search))
}

module.exports = CommandoRegistry