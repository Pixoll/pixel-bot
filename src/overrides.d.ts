import { User } from 'discord.js';
import 'lodash';
import { CommandoUser } from 'pixoll-commando';

type BaseModerationActionData = [
    guild: CommandoGuild, moderator: CommandoUser | User, user: CommandoUser | User, reason: string
];

declare module 'pixoll-commando' {
    interface CommandoClientEvents {
        guildMemberMute: [...BaseModerationActionData, duration: number];
        guildMemberTimeout: [...BaseModerationActionData, duration: number];
        guildMemberUnmute: BaseModerationActionData;
        guildMemberWarn: BaseModerationActionData;
        moduleStatusChange: [guild: CommandoGuild, moduleName: string, enabled: boolean];
    }
}

declare module 'lodash' {
    interface LoDashStatic {
        /**
         * Converts the first character of string to upper case and the remaining to lower case.
         *
         * @param string The string to capitalize.
         * @return Returns the capitalized string.
         */
        capitalize<T extends string>(string?: T): Capitalize<Lowercase<T>>;
    }
}
