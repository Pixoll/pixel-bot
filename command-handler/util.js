// This returns Object.prototype in order to return a valid object
// without creating a new one each time this is called just to discard it the moment after.
const isConstructorProxyHandler = {
	construct() {
		return Object.prototype
	}
}

function escapeRegex(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}

/**
 * @param {*[]} items
 * @param {string} label
 * @param {string} property
 */
function disambiguation(items, label, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ')
	return `**Multiple ${label} found, please be more specific:** ${itemList}`
}

function isConstructor(func, _class) {
	try {
		// eslint-disable-next-line no-new
		new new Proxy(func, isConstructorProxyHandler)()
		if (!_class) return true
		return func.prototype instanceof _class
	} catch (err) {
		return false
	}
}

function paginate(items, page = 1, pageLength = 10) {
	const maxPage = Math.ceil(items.length / pageLength)
	if (page < 1) page = 1
	if (page > maxPage) page = maxPage
	const startIndex = (page - 1) * pageLength
	return {
		items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
		page,
		maxPage,
		pageLength
	}
}

/** @type {Object<string,string>} */
const permissions = {
	CREATE_INSTANT_INVITE: 'Create instant invite',
	KICK_MEMBERS: 'Kick members',
	BAN_MEMBERS: 'Ban members',
	ADMINISTRATOR: 'Administrator',
	MANAGE_CHANNELS: 'Manage channels',
	MANAGE_GUILD: 'Manage server',
	ADD_REACTIONS: 'Add reactions',
	VIEW_AUDIT_LOG: 'View audit log',
	PRIORITY_SPEAKER: 'Priority speaker',
	STREAM: 'Video',
	VIEW_CHANNEL: 'View channels',
	SEND_MESSAGES: 'Send messages',
	SEND_TTS_MESSAGES: 'Send TTS messages',
	MANAGE_MESSAGES: 'Manage messages',
	EMBED_LINKS: 'Embed links',
	ATTACH_FILES: 'Attach files',
	READ_MESSAGE_HISTORY: 'Read message history',
	MENTION_EVERYONE: 'Mention everyone',
	USE_EXTERNAL_EMOJIS: 'Use external emojis',
	VIEW_GUILD_INSIGHTS: 'View server insights',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute members',
	DEAFEN_MEMBERS: 'Deafen members',
	MOVE_MEMBERS: 'Move members',
	USE_VAD: 'Use voice activity',
	CHANGE_NICKNAME: 'Change nickname',
	MANAGE_NICKNAMES: 'Manage nicknames',
	MANAGE_ROLES: 'Manage roles',
	MANAGE_WEBHOOKS: 'Manage webhooks',
	MANAGE_EMOJIS_AND_STICKERS: 'Manage emojis and stickers',
	USE_APPLICATION_COMMANDS: 'Use application commands',
	REQUEST_TO_SPEAK: 'Request to speak',
	MANAGE_THREADS: 'Manage threads',
	USE_PUBLIC_THREADS: 'Use public threads',
	USE_PRIVATE_THREADS: 'Use private threads',
	CREATE_PUBLIC_THREADS: 'Create public threads',
	CREATE_PRIVATE_THREADS: 'Create private threads',
	USE_EXTERNAL_STICKERS: 'Use external stickers',
}

const { StringResolvable } = require('./typings')

/**
 * Resolves a StringResolvable to a string.
 * @param {StringResolvable} data The string resolvable to resolve
 * @returns {string}
 */
function resolveString(data) {
	if (typeof data === 'string') return data
	if (Array.isArray(data)) return data.join('\n')
	return String(data)
}

module.exports = {
	escapeRegex,
	disambiguation,
	paginate,
	permissions,
	isConstructor,
	resolveString
}