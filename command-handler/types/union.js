const { CommandoClient, CommandoMessage, Argument } = require('../typings')
const ArgumentType = require('./base')

/**
 * A type for command arguments that handles multiple other types
 * @extends {ArgumentType}
 */
class ArgumentUnionType extends ArgumentType {
	/**
	 * @param {CommandoClient} client
	 * @param {string} id
	 */
	constructor(client, id) {
		super(client, id)

		/**
		 * Types to handle, in order of priority
		 * @type {ArgumentType[]}
		 */
		this.types = []

		const typeIds = id.split('|')
		for (const typeId of typeIds) {
			const type = client.registry.types.get(typeId)
			if (!type) throw new Error(`Argument type "${typeId}" is not registered.`)
			this.types.push(type)
		}
	}

	/**
	 * @param {string} val Value to validate
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is valid, or an error message
	 */
	async validate(val, msg, arg) {
		let results = this.types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg))
		results = await Promise.all(results)
		if (results.some(valid => valid && typeof valid !== 'string')) return true

		const errors = results.filter(valid => typeof valid === 'string')
		if (errors.length > 0) return errors.join('\n')

		return false
	}

	/**
	 * @param {string} val Value to parse
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Usable value
	 */
	async parse(val, msg, arg) {
		let results = this.types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg))
		results = await Promise.all(results)

		for (let i = 0; i < results.length; i++) {
			if (results[i] && typeof results[i] !== 'string') return this.types[i].parse(val, msg, arg)
		}

		throw new Error(`Couldn't parse value "${val}" with union type ${this.id}.`)
	}

	/**
	 * @param {string} val Value to check for emptiness
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is empty
	 */
	isEmpty(val, msg, arg) {
		return !this.types.some(type => !type.isEmpty(val, msg, arg))
	}
}

module.exports = ArgumentUnionType