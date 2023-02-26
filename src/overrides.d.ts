import { User } from 'discord.js';
import 'pixoll-commando';

type BaseModerationActionData = [guild: CommandoGuild, moderator: User, user: User, reason: string];

declare module 'pixoll-commando' {
    interface CommandoClientEvents {
        guildMemberMute: [...BaseModerationActionData, duration: number];
        guildMemberTimeout: [...BaseModerationActionData, duration: number];
        guildMemberUnmute: BaseModerationActionData;
        guildMemberWarn: BaseModerationActionData;
        moduleStatusChange: [guild: CommandoGuild, moduleName: string, enabled: boolean];
    }
}
