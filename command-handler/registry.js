/* eslint-disable no-unused-vars */
const path = require('path')
const { Collection } = require('discord.js')
const Command = require('./commands/base')
const CommandGroup = require('./commands/group')
const CommandoMessage = require('./extensions/message')
const ArgumentType = require('./types/base')
const { APIApplicationCommand, APIApplicationCommandOption } = require('discord-api-types/payloads/v9')
const { RESTPostAPIChatInputApplicationCommandsJSONBody } = require('discord-api-types/rest/v9')
const {
	CommandoClient, CommandInstances, DefaultTypesOptions, CommandGroupResolvable, CommandResolvable, RequireAllOptions
} = require('./typings')
const requireAll = require('require-all')
const { capitalize } = require('lodash')
/* eslint-enable no-unused-vars */

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
		 * Registered command groups, mapped by their ID
		 * @type {Collection<string, CommandGroup>}
		 */
		this.groups = new Collection()

		/**
		 * Registered argument types, mapped by their ID
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
	 * Registers every client and guild slash command available - this may only be called upon startup.
	 * @private
	 */
	async registerSlashCommands() {
		const { commands, client } = this
		const { application, options, guilds } = client

		const testCommands = commands.filter(cmd => cmd.test && cmd.slash).map(cmd => cmd._slashToAPI)
		if (testCommands.length !== 0) {
			if (typeof options.testGuild !== 'string') throw new TypeError('Client testGuild must be a string.')

			const guild = guilds.resolve(options.testGuild)
			if (!guild) throw new TypeError('Client testGuild must be a valid Guild ID.')

			const current = await guild.commands.fetch()
			const [updated, removed] = getUpdatedSlashCommands(current, testCommands)
			for (const command of updated) {
				const match = current.find(cmd => cmd.name === command.name)
				if (match) {
					await guild.commands.edit(match, command)
				} else {
					await guild.commands.create(command)
				}
			}
			for (const command of removed) {
				const match = current.find(cmd => cmd.name === command.name)
				if (match) await guild.commands.delete(match)
			}

			client.emit('debug', `Loaded ${testCommands.length} guild slash commands`)
		}

		const slashCommands = commands.filter(cmd => !cmd.test && cmd.slash).map(cmd => cmd._slashToAPI)
		if (slashCommands.length === 0) return

		const current = await application.commands.fetch()
		const [updated, removed] = getUpdatedSlashCommands(current, slashCommands)
		for (const command of updated) {
			const match = current.find(cmd => cmd.name === command.name)
			if (match) {
				await application.commands.edit(match, command)
			} else {
				await application.commands.create(command)
			}
		}
		for (const command of removed) {
			const match = current.find(cmd => cmd.name === command.name)
			if (match) await application.commands.delete(match)
		}

		client.emit('debug', `Loaded ${slashCommands.length} public slash commands`)
	}

	/**
	 * Registers a single group
	 * @param {CommandGroup|Function|Object|string} group A CommandGroup instance, a constructor, or the group ID
	 * @param {string} [name] Name for the group (if the first argument is the group ID)
	 * @param {boolean} [guarded] Whether the group should be guarded (if the first argument is the group ID)
	 * @return {CommandoRegistry}
	 * @see {@link CommandoRegistry#registerGroups}
	 */
	registerGroup(group, name, guarded) {
		const { client, groups } = this

		if (typeof group === 'string') {
			group = new CommandGroup(client, group, name, guarded)
		} else if (isConstructor(group, CommandGroup)) {
			group = new group(client)
		} else if (typeof group === 'object' && !(group instanceof CommandGroup)) {
			group = new CommandGroup(client, group.id, group.name, group.guarded)
		}

		const existing = groups.get(group.id)
		if (existing) {
			existing.name = group.name
			client.emit('debug', `Group ${group.id} is already registered renamed it to "${group.name}".`)
		} else {
			groups.set(group.id, group)
			client.emit('groupRegister', group, this)
			client.emit('debug', `Registered group ${group.id}.`)
		}

		return this
	}

	/* eslint-disable no-tabs */
	/**
	 * Registers multiple groups
	 * @param {CommandGroup[]|Function[]|Object[]|string[][]} groups An array of CommandGroup instances,
	 * constructors, plain objects (with ID, name, and guarded properties),
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
	/* eslint-enable no-tabs */
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
		const { client, commands, groups, unknownCommand } = this

		if (isConstructor(command, Command)) command = new command(client)
		else if (isConstructor(command.default, Command)) command = new command.default(client)
		if (!(command instanceof Command)) throw new Error(`Invalid command object to register: ${command}`)

		const { name, aliases, groupId, memberName, unknown } = command

		// Make sure there aren't any conflicts
		if (commands.some(cmd => cmd.name === name || cmd.aliases.includes(name))) {
			throw new Error(`A command with the name/alias "${name}" is already registered.`)
		}
		for (const alias of aliases) {
			if (commands.some(cmd => cmd.name === alias || cmd.aliases.includes(alias))) {
				throw new Error(`A command with the name/alias "${alias}" is already registered.`)
			}
		}
		const group = groups.find(grp => grp.id === groupId)
		if (!group) throw new Error(`Group "${groupId}" is not registered.`)
		if (group.commands.some(cmd => cmd.memberName === memberName)) {
			throw new Error(`A command with the member name "${memberName}" is already registered in ${group.id}`)
		}
		if (unknown && unknownCommand) throw new Error('An unknown command is already registered.')

		// Add the command
		command.group = group
		group.commands.set(name, command)
		commands.set(name, command)
		if (unknown) this.unknownCommand = command

		client.emit('commandRegister', command, this)
		client.emit('debug', `Registered command ${group.id}:${memberName}.`)

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
		const obj = requireAll(options)
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
		const { client, types } = this

		if (isConstructor(type, ArgumentType)) type = new type(client)
		else if (isConstructor(type.default, ArgumentType)) type = new type.default(client)

		if (!(type instanceof ArgumentType)) throw new Error(`Invalid type object to register: ${type}`)

		// Make sure there aren't any conflicts
		if (types.has(type.id)) throw new Error(`An argument type with the ID "${type.id}" is already registered.`)

		// Add the type
		types.set(type.id, type)

		client.emit('typeRegister', type, this)
		client.emit('debug', `Registered argument type ${type.id}.`)

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
			const valid = isConstructor(type, ArgumentType) ||
				isConstructor(type.default, ArgumentType) ||
				type instanceof ArgumentType ||
				type.default instanceof ArgumentType

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
		const obj = requireAll(options)
		const types = []
		for (const type of Object.values(obj)) types.push(type)
		return this.registerTypes(types, true)
	}

	/**
	 * Registers the default argument types to the registry
	 * @param {DefaultTypesOptions} [types] Object specifying which types to register
	 * @return {CommandoRegistry}
	 */
	registerDefaultTypes(types = {}) {
		const defaultTypes = Object.keys(requireAll(path.join(__dirname, '/types')))
			.filter(k => k !== 'base' && k !== 'union')
			.reduce((obj, k) => {
				obj[removeDashes(k)] = true
				return obj
			}, {})
		Object.assign(defaultTypes, types)

		for (let type in defaultTypes) {
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
		const { client, commands, unknownCommand } = this

		if (isConstructor(command, Command)) command = new command(client)
		else if (isConstructor(command.default, Command)) command = new command.default(client)
		if (!(command instanceof Command)) throw new Error(`Invalid command object to register: ${command}`)

		const { name, groupId, memberName, unknown } = command

		if (name !== oldCommand.name) throw new Error('Command name cannot change.')
		if (groupId !== oldCommand.groupId) throw new Error('Command group cannot change.')
		if (memberName !== oldCommand.memberName) throw new Error('Command memberName cannot change.')
		if (unknown && this.unknownCommand !== oldCommand) {
			throw new Error('An unknown command is already registered.')
		}

		command.group = this.resolveGroup(groupId)
		command.group.commands.set(name, command)
		commands.set(name, command)
		if (unknownCommand === oldCommand) this.unknownCommand = null
		if (unknown) this.unknownCommand = command

		client.emit('commandReregister', command, oldCommand)
		client.emit('debug', `Reregistered command ${groupId}:${memberName}.`)
	}

	/**
	 * Unregisters a command
	 * @param {Command} command Command to unregister
	 */
	unregisterCommand(command) {
		const { commands, unknownCommand, client } = this
		const { name, groupId, memberName } = command

		commands.delete(name)
		command.group.commands.delete(name)
		if (unknownCommand === command) this.unknownCommand = null

		client.emit('commandUnregister', command)
		client.emit('debug', `Unregistered command ${groupId}:${memberName}.`)
	}

	/**
	 * Finds all groups that match the search string
	 * @param {string} [searchString] The string to search for
	 * @param {boolean} [exact=false] Whether the search should be exact
	 * @return {CommandGroup[]} All groups that are found
	 */
	findGroups(searchString = null, exact = false) {
		const { groups } = this
		if (!searchString) return groups

		// Find all matches
		const lcSearch = searchString.toLowerCase()
		const matchedGroups = groups.filter(
			exact ? groupFilterExact(lcSearch) : groupFilterInexact(lcSearch)
		).toJSON()
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
	 * @param {CommandInstances} [instances] The instances to check usability against
	 * @return {Command[]} All commands that are found
	 */
	findCommands(searchString = null, exact = false, { message, interaction } = {}) {
		const { commands } = this
		if (!searchString) {
			return (message || interaction) ?
				commands.filter(cmd => cmd.isUsable({ message, interaction })).toJSON() :
				commands.toJSON()
		}

		// Find all matches
		const lcSearch = searchString.toLowerCase()
		const matchedCommands = commands.filter(
			exact ? commandFilterExact(lcSearch) : commandFilterInexact(lcSearch)
		).toJSON()
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
	 * Resolves a command file path from a command's group ID and memberName
	 * @param {string} group ID of the command's group
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

function isConstructor(func, _class) {
	try {
		// eslint-disable-next-line no-new
		new new Proxy(func, {
			construct: () => Object.prototype
		})()
		if (!_class) return true
		return func.prototype instanceof _class
	} catch (err) {
		return false
	}
}

/**
 * Removes dashes from the string and capitalizes the remaining strings
 * @param {string} str The string to parse
 */
function removeDashes(str) {
	const arr = str.split('-')
	const first = arr.shift()
	const rest = arr.map(capitalize).join('')
	return first + rest
}

const apiCmdOptionType = {
	SUB_COMMAND: 1,
	SUB_COMMAND_GROUP: 2,
	STRING: 3,
	INTEGER: 4,
	BOOLEAN: 5,
	USER: 6,
	CHANNEL: 7,
	ROLE: 8,
	MENTIONABLE: 9,
	NUMBER: 10
}

const apiCmdOptChanType = {
	GUILD_TEXT: 0,
	GUILD_VOICE: 2,
	GUILD_CATEGORY: 4,
	GUILD_NEWS: 5,
	GUILD_NEWS_THREAD: 10,
	GUILD_PUBLIC_THREAD: 11,
	GUILD_PRIVATE_THREAD: 12,
	GUILD_STAGE_VOICE: 13
}

/**
 * Compares and returns the difference between a set of arrays
 * @param {APIApplicationCommand[]} oldCommands The old array
 * @param {RESTPostAPIChatInputApplicationCommandsJSONBody[]} newCommands The new array
 * @returns {RESTPostAPIChatInputApplicationCommandsJSONBody[][]} `[updated, removed]`
 */
function getUpdatedSlashCommands(oldCommands = [], newCommands = []) {
	oldCommands = JSON.parse(JSON.stringify(oldCommands))
	newCommands = JSON.parse(JSON.stringify(newCommands))

	oldCommands.forEach(apiCommand => {
		for (const prop in apiCommand) {
			if (['name', 'description', 'options'].includes(prop)) continue
			delete apiCommand[prop]
		}
		apiCommand.type = 1
		parseApiCmdOptions(apiCommand.options)
		if (apiCommand.options?.length === 0) {
			delete apiCommand.options
		}
	})

	const map1 = new Map()
	oldCommands.forEach(e => map1.set(JSON.stringify(orderObjProps(e)), true))
	const updated = newCommands.filter(e => !map1.has(JSON.stringify(orderObjProps(e))))

	const map2 = new Map()
	newCommands.forEach(e => map2.set(e.name), true)
	const removed = oldCommands.filter(e => !map2.has(e.name))

	return [updated, removed]
}

/** @param {APIApplicationCommandOption[]} options */
function parseApiCmdOptions(options) {
	options.forEach(option => {
		if (option.required === false) {
			delete option.required
		}
		for (const oprop in option) {
			if (typeof option[oprop] === 'undefined') {
				delete option[oprop]
				continue
			}
			if (oprop.toLowerCase() === oprop) continue
			const toApply = oprop.replace(/[A-Z]/g, '_$&').toLowerCase()
			option[toApply] = option[oprop]
			delete option[oprop]
			if (toApply === 'channel_types') {
				for (let i = 0; i < option[toApply].length; i++) {
					option[toApply][i] = apiCmdOptChanType[option[toApply][i]]
				}
			}
		}
		option.type = apiCmdOptionType[option.type]
		if (option.options) parseApiCmdOptions(option.options)
	})
}

function orderObjProps(obj) {
	const ordered = {}
	for (const key of Object.keys(obj).sort()) {
		if (Array.isArray(obj[key])) {
			ordered[key] = []
			obj[key].forEach(nested => {
				ordered[key].push(orderObjProps(nested))
			})
		} else if (typeof obj[key] === 'object') {
			ordered[key] = orderObjProps(obj[key])
		} else {
			ordered[key] = obj[key]
		}
	}
	return ordered
}
