"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusBedrock = exports.statusJava = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const apiURL = 'https://api.mcstatus.io/v2';
async function statusJava(host, port = 25565) {
    const start = Date.now();
    const status = await apiGet('status/java', `${host}:${port}`);
    if (!status)
        return null;
    status.ping = Date.now() - start;
    return status;
}
exports.statusJava = statusJava;
async function statusBedrock(host, port = 19132) {
    const start = Date.now();
    const status = await apiGet('status/bedrock', `${host}:${port}`);
    if (!status)
        return null;
    status.ping = Date.now() - start;
    return status;
}
exports.statusBedrock = statusBedrock;
async function apiGet(endpoint, address) {
    const requestURL = `${apiURL}/${endpoint}/${address}`;
    const response = await (0, node_fetch_1.default)(requestURL, {
        method: 'GET',
    });
    if (!response.ok)
        null;
    const json = await response.json();
    return json;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluZWNyYWZ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL21pbmVjcmFmdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0REFBK0I7QUFFL0IsTUFBTSxNQUFNLEdBQUcsNEJBQTRCLENBQUM7QUFJckMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxJQUFZLEVBQUUsSUFBSSxHQUFHLEtBQUs7SUFDdkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFxQixhQUFhLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNsRixJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUNqQyxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBTkQsZ0NBTUM7QUFFTSxLQUFLLFVBQVUsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsS0FBSztJQUMxRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekIsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQXdCLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEYsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPLElBQUksQ0FBQztJQUN6QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFDakMsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQU5ELHNDQU1DO0FBRUQsS0FBSyxVQUFVLE1BQU0sQ0FBSSxRQUEyQixFQUFFLE9BQWU7SUFDakUsTUFBTSxVQUFVLEdBQUcsR0FBRyxNQUFNLElBQUksUUFBUSxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQ3RELE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSxvQkFBSyxFQUFDLFVBQVUsRUFBRTtRQUNyQyxNQUFNLEVBQUUsS0FBSztLQUNoQixDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFBRSxJQUFJLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFPLENBQUM7SUFDeEMsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyJ9