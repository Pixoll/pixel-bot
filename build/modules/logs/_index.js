"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogsChannel = void 0;
/** Re-sends audit-logs when deleted. */
async function default_1(client) {
    await sendLogs(client);
}
exports.default = default_1;
/**
 * Gets the audit-logs channel
 * @param guild The guild to look into
 */
async function getLogsChannel(guild) {
    const data = await guild.database.setup.fetch();
    const channel = guild.channels.resolve(data?.logsChannel ?? '');
    return channel;
}
exports.getLogsChannel = getLogsChannel;
async function sendLogs(client) {
    const guilds = client.guilds.cache.toJSON();
    for (const guild of guilds) {
        const logsChannel = await getLogsChannel(guild);
        if (!logsChannel) {
            guild.queuedLogs = [];
            continue;
        }
        while (guild.queuedLogs.length > 0) {
            const embeds = guild.queuedLogs.splice(0, 10);
            await logsChannel.send({ embeds }).catch(() => null);
        }
    }
    setTimeout(async () => await sendLogs(client), 3000);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2luZGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbG9ncy9faW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0Esd0NBQXdDO0FBQ3pCLEtBQUssb0JBQVcsTUFBNEI7SUFDdkQsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLGNBQWMsQ0FBQyxLQUFvQjtJQUNyRCxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2hELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxXQUFXLElBQUksRUFBRSxDQUF1QixDQUFDO0lBQ3RGLE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFKRCx3Q0FJQztBQUVELEtBQUssVUFBVSxRQUFRLENBQUMsTUFBNEI7SUFDaEQsTUFBTSxNQUFNLEdBQUksTUFBTSxDQUFDLE1BQTBDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBRWpGLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQ3hCLE1BQU0sV0FBVyxHQUFHLE1BQU0sY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDZCxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUN0QixTQUFTO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNoQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUMsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEQ7S0FDSjtJQUVELFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pELENBQUMifQ==