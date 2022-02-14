/* eslint-disable no-unused-vars */
const { Command, CommandInstances, CommandoMessage } = require('pixoll-commando');
const { TextChannel, Role, Message } = require('discord.js');
const { basicEmbed, basicCollector, getArgument, isValidRole } = require('../../utils/functions');
const { stripIndent, oneLine } = require('common-tags');
const { ReactionRoleSchema } = require('../../schemas/types');
/* eslint-enable no-unused-vars */

const emojiRegex = new RegExp(`${require('emoji-regex')().source}|\\d{17,20}`, 'g');

/** A command that can be run in a client */
module.exports = class ReactionRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reaction-role',
            aliases: ['reactrole', 'rrole', 'reactionrole', 'react-role'],
            group: 'managing',
            description: 'Create or remove reaction roles.',
            details: stripIndent`
                \`channel\` can be either a channel's name, mention or ID.
                \`msg ID\` has to be a message's ID that's in the **same channel** that you specified.
            `,
            format: stripIndent`
                reactrole create [channel] [msg ID] - Create reaction roles.
                reactrole remove [channel] [msg ID] - Remove reaction roles.
            `,
            examples: [
                'reactrole create #reaction-roles 826935004936142918',
                'reactrole remove #self-roles 826935004936142918'
            ],
            clientPermissions: ['ADD_REACTIONS'],
            userPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            deprecated: true,
            replacing: 'button-role',
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'Do you want to create or remove the reaction roles?',
                    type: 'string',
                    oneOf: ['create', 'remove']
                },
                {
                    key: 'channel',
                    prompt: 'On what channel do you want to create or remove the reaction roles?',
                    type: 'text-channel'
                },
                {
                    key: 'msgId',
                    label: 'message ID',
                    prompt: 'On what message do you want to create or remove the reaction roles?',
                    type: 'string'
                }
            ]
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'create'|'remove'} args.subCommand The sub-command to use
     * @param {TextChannel} args.channel The text channel of the reaction messages
     * @param {string} args.msgId The message of the reaction messages
     */
    async run({ message }, { subCommand, channel, msgId }) {
        subCommand = subCommand.toLowerCase();

        let msg = await channel?.messages.fetch(msgId).catch(() => null);
        if (message) {
            while (!(msg instanceof Message)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
                if (cancelled) return;
                msg = await channel.messages.fetch(value).catch(() => null);
            }
        }

        this.db = message.guild.database.reactionRoles;
        const data = await this.db.fetch({ channel: channel.id, message: msg.id });

        switch (subCommand) {
            case 'create':
                return await this.create(message, channel, msg);
            case 'remove':
                return await this.remove(message, msg, data);
        }
    }

    /**
     * The `create` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel} channel The text channel of the reaction roles to create
     * @param {Message} msg The message of the reaction roles to create
     */
    async create(message, channel, msg) {
        const { client, guildId } = message;
        const roleType = client.registry.types.get('role');

        const roles = [];
        while (roles.length === 0) {
            const rolesMsg = await basicCollector({ message }, {
                fieldName: oneLine`
                    What are the roles that you want to assign?
                    Please send them separated by commas (max. 10 at once).
                `
            }, { time: 2 * 60_000 });
            if (!rolesMsg) return;

            for (const str of rolesMsg.content.split(/\s*,\s*/).slice(0, 10)) {
                const con1 = roleType.validate(str, message);
                const con2 = isValidRole(message, con1 === true ? roleType.parse(str, message) : null);
                if (!con1 && !con2) continue;

                /** @type {Role} */
                const role = roleType.parse(str, message);
                roles.push(role);
            }
        }

        const allEmojis = client.emojis.cache;
        const emojis = [];
        while (roles.length !== emojis.length) {
            const emojisMsg = await basicCollector({ message }, {
                fieldName: oneLine`
                    Now, what emojis should the bot react with in the message?
                    These will be applied to the roles you specified in the same exact order.
                `
            }, { time: 2 * 60_000 });
            if (!emojisMsg) return;

            const match = emojisMsg.content.match(emojiRegex)?.map(e => e).filter(e => e) || [];
            for (const emoji of match) {
                if (roles.length === emojis.length) break;
                if (emojis.includes(emoji)) continue;

                if (!parseInt(emoji)) emojis.push(emoji);
                if (allEmojis.get(emoji)) emojis.push(emoji);
            }
        }

        for (const emoji of emojis) await msg.react(emoji);

        await this.db.add({
            guild: guildId,
            channel: channel.id,
            message: msg.id,
            roles: roles.map(r => r.id),
            emojis: emojis
        });

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `The reaction roles were successfully created at [this message](${msg.url}).`
        }));
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Message} msg The message of the reaction roles to remove
     * @param {ReactionRoleSchema} data The data of the reaction roles
     */
    async remove(message, { url }, data) {
        if (!data) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the reaction roles you were looking for.'
            }));
        }

        await data.deleteOne();

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `The reaction roles of [this message](${url}) were successfully removed.`
        }));
    }
};
