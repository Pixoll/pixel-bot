/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
const { Client, User, UserResolvable, Collection, Permissions } = require('discord.js')
const CommandoRegistry = require('./registry')
const CommandDispatcher = require('./dispatcher')
const GuildSettingsHelper = require('./providers/helper')
const SettingProvider = require('./providers/base')
const { CommandoClientOptions, GuildDatabaseManager, CommandoGuildManager } = require('./typings')
const CommandoMessage = require('./extensions/message')
// const CommandoGuild = require('./extensions/guild')
const ClientDatabaseManager = require('./database/ClientDatabaseManager')
/* eslint-enable no-unused-vars */

/**
 * Discord.js Client with a command framework
 * @extends {Client}
 */
class CommandoClient extends Client {
	/**
	 * @param {CommandoClientOptions} [options] Options for the client
	 */
	constructor(options = {}) {
		if (typeof options.prefix === 'undefined') options.prefix = '!'
		if (options.prefix === null) options.prefix = ''
		if (typeof options.commandEditableDuration === 'undefined') options.commandEditableDuration = 30
		if (typeof options.nonCommandEditable === 'undefined') options.nonCommandEditable = true
		super(options)

		/**
		 * Options for the client
		 * @type {CommandoClientOptions}
		 */
		this.options

		if (typeof options.inviteOptions === 'object') {
			const invitePerms = options.inviteOptions.permissions
			options.inviteOptions.permissions = Permissions.resolve(invitePerms)
		}

		/**
		 * Invite for the bot
		 * @type {?string}
		 */
		this.botInvite = typeof options.inviteOptions === 'string' ? options.inviteOptions : null
		if (!this.botInvite) {
			this.once('ready', () => {
				if (this.options.inviteOptions) {
					this.botInvite = this.generateInvite(this.options.inviteOptions)
				}
			})
		}

		/**
		 * @type {CommandoGuildManager}
		 */
		this.guilds

		/**
		 * The client's command registry
		 * @type {CommandoRegistry}
		 */
		this.registry = new CommandoRegistry(this)

		/**
		 * The client's command dispatcher
		 * @type {CommandDispatcher}
		 */
		this.dispatcher = new CommandDispatcher(this, this.registry)

		/**
		 * The client's database manager
		 * @type {ClientDatabaseManager}
		 */
		this.database = new ClientDatabaseManager(this)

		/**
		 * The guilds' database manager, mapped by the guilds ids
		 * @type {Collection<string, GuildDatabaseManager>}
		 */
		this.databases = new Collection()

		/**
		 * The client's setting provider
		 * @type {?SettingProvider}
		 */
		this.provider = null

		/**
		 * Shortcut to use setting provider methods for the global settings
		 * @type {GuildSettingsHelper}
		 */
		this.settings = new GuildSettingsHelper(this, null)

		/**
		 * Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter
		 * @type {?string}
		 * @private
		 */
		this._prefix = null

		// Set up message command handling
		const catchErr = err => {
			this.emit('error', err)
		}
		this.on('messageCreate', async message => {
			const commando = new CommandoMessage(this, message)
			this.emit('cMessageCreate', commando)
			await this.dispatcher.handleMessage(commando).catch(catchErr)
		})
		this.on('messageUpdate', async (oldMessage, newMessage) => {
			const commando = new CommandoMessage(this, newMessage)
			await this.dispatcher.handleMessage(commando, oldMessage).catch(catchErr)
		})

		// Set up slash command handling
		this.once('ready', async () => {
			await this.registry.registerSlashCommands()
		})
		this.on('interactionCreate', async interaction => {
			await this.dispatcher.handleSlash(interaction).catch(catchErr)
		})

		// Fetch the owner(s)
		if (options.owner) {
			this.once('ready', () => {
				if (Array.isArray(options.owner) || options.owner instanceof Set) {
					for (const owner of options.owner) {
						this.users.fetch(owner).catch(err => {
							this.emit('warn', `Unable to fetch owner ${owner}.`)
							this.emit('error', err)
						})
					}
				} else {
					this.users.fetch(options.owner).catch(err => {
						this.emit('warn', `Unable to fetch owner ${options.owner}.`)
						this.emit('error', err)
					})
				}
			})
		}
	}

	/**
	 * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
	 * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
	 * @type {string}
	 * @emits {@link CommandoClient#commandPrefixChange}
	 */
	get prefix() {
		if (typeof this._prefix === 'undefined' || this._prefix === null) return this.options.prefix
		return this._prefix
	}

	set prefix(prefix) {
		this._prefix = prefix
		this.emit('commandPrefixChange', null, this._prefix)
	}

	/**
	 * Owners of the bot, set by the {@link CommandoClientOptions#owner} option.
	 * <info>If you simply need to check if a user is an owner of the bot, please instead use
	 * {@link CommandoClient#isOwner}.</info>
	 * @type {?User[]}
	 * @readonly
	 */
	get owners() {
		if (!this.options.owner) return null
		if (typeof this.options.owner === 'string') return [this.users.cache.get(this.options.owner)]
		const owners = []
		for (const owner of this.options.owner) owners.push(this.users.cache.get(owner))
		return owners
	}

	/**
	 * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
	 * @param {UserResolvable} user User to check for ownership
	 * @return {boolean}
	 */
	isOwner(user) {
		if (!this.options.owner) return false
		user = this.users.resolve(user)
		if (!user) throw new RangeError('Unable to resolve user.')
		if (typeof this.options.owner === 'string') return user.id === this.options.owner
		if (Array.isArray(this.options.owner)) return this.options.owner.includes(user.id)
		if (this.options.owner instanceof Set) return this.options.owner.has(user.id)
		throw new RangeError('The client\'s "owner" option is an unknown value.')
	}

	/**
	 * Sets the setting provider to use, and initialises it once the client is ready
	 * @param {SettingProvider|Promise<SettingProvider>} provider Provider to use
	 * @return {Promise<void>}
	 */
	async setProvider(provider) {
		const newProvider = await provider
		this.provider = newProvider

		if (this.readyTimestamp) {
			this.emit('debug', `Provider set to ${newProvider.constructor.name} - initialising...`)
			await newProvider.init(this)
			this.emit('debug', 'Provider finished initialisation.')
			return undefined
		}

		this.emit('debug', `Provider set to ${newProvider.constructor.name} - will initialise once ready.`)
		await new Promise(resolve => {
			this.once('ready', () => {
				this.emit('debug', 'Initialising provider...')
				resolve(newProvider.init(this))
			})
		})
		this.emit('providerReady', provider)
		this.emit('debug', 'Provider finished initialisation.')
		return undefined
	}

	/** Logs out, terminates the connection to Discord, and destroys the client. */
	async destroy() {
		await super.destroy()
		if (this.provider) await this.provider.destroy()
	}
}

module.exports = CommandoClient