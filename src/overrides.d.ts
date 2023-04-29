import { User } from 'discord.js';
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
