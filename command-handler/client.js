/* eslint-disable no-unused-vars */
const { Client, User, UserResolvable, Collection, Permissions } = require('discord.js')
const CommandoRegistry = require('./registry')
const CommandDispatcher = require('./dispatcher')
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
		const { prefix, commandEditableDuration, nonCommandEditable, inviteOptions, owner } = options

		if (typeof prefix === 'undefined') options.prefix = '!'
		if (prefix === null) options.prefix = ''
		if (typeof commandEditableDuration === 'undefined') options.commandEditableDuration = 30
		if (typeof nonCommandEditable === 'undefined') options.nonCommandEditable = true
		super(options)

		/**
		 * Options for the client
		 * @type {CommandoClientOptions}
		 */
		// eslint-disable-next-line no-unused-expressions
		this.options

		if (typeof inviteOptions === 'object') {
			const invitePerms = inviteOptions.permissions
			inviteOptions.permissions = Permissions.resolve(invitePerms)
		}

		/**
		 * Invite for the bot
		 * @type {?string}
		 */
		this.botInvite = typeof inviteOptions === 'string' ? inviteOptions : null
		if (!this.botInvite) {
			this.once('ready', () => {
				if (inviteOptions) {
					this.botInvite = this.generateInvite(inviteOptions)
				}
			})
		}

		/**
		 * @type {CommandoGuildManager}
		 */
		// eslint-disable-next-line no-unused-expressions
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
				if (Array.isArray(owner) || owner instanceof Set) {
					for (const user of owner) {
						this.users.fetch(user).catch(err => {
							this.emit('warn', `Unable to fetch owner ${user}.`)
							this.emit('error', err)
						})
					}
				} else {
					this.users.fetch(owner).catch(err => {
						this.emit('warn', `Unable to fetch owner ${owner}.`)
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
		const { _prefix, options } = this
		if (typeof _prefix === 'undefined' || _prefix === null) return options.prefix
		return _prefix
	}

	set prefix(prefix) {
		this._prefix = prefix
		this.emit('commandPrefixChange', null, prefix)
	}

	/**
	 * Owners of the bot, set by the {@link CommandoClientOptions#owner} option.
	 * <info>If you simply need to check if a user is an owner of the bot, please instead use
	 * {@link CommandoClient#isOwner}.</info>
	 * @type {?User[]}
	 * @readonly
	 */
	get owners() {
		const { options, users } = this
		const { cache } = users
		const { owner } = options

		if (!owner) return null
		if (typeof owner === 'string') return [cache.get(owner)]
		const owners = []
		for (const user of owner) owners.push(cache.get(user))
		return owners
	}

	/**
	 * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
	 * @param {UserResolvable} user User to check for ownership
	 * @return {boolean}
	 */
	isOwner(user) {
		const { users, options } = this
		const { owner } = options

		if (!owner) return false
		user = users.resolve(user)
		if (!user) throw new RangeError('Unable to resolve user.')
		const { id } = user

		if (typeof owner === 'string') return id === owner
		if (Array.isArray(owner)) return owner.includes(id)
		if (owner instanceof Set) return owner.has(id)
		throw new RangeError('The client\'s "owner" option is an unknown value.')
	}

	/** Logs out, terminates the connection to Discord, and destroys the client. */
	async destroy() {
		super.destroy()
	}
}

module.exports = CommandoClient
