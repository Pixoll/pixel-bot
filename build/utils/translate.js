"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const google_translate_api_1 = require("@vitalets/google-translate-api");
const http_proxy_agent_1 = __importDefault(require("http-proxy-agent"));
const pixoll_commando_1 = require("pixoll-commando");
// TODO: Find a more reliable method for production
const availableProxyUrls = [
    'http://23.144.56.239:80',
    'http://107.6.27.132:80',
    'http://165.154.224.14:80',
    'http://45.62.167.249:80',
    'http://51.159.115.233:3128',
    'http://103.37.124.92:80',
    'http://103.178.54.149:80',
    'http://47.241.122.19:80',
    'http://119.237.37.28:80',
    'http://211.224.152.224:8001',
    'http://117.54.120.229:8888',
    'http://91.229.114.153:80',
    'http://80.15.19.7:80',
    'http://167.99.189.62:8081',
    'http://203.202.245.62:80',
    'http://2.92.49.249:80',
    'http://45.32.245.26:80',
    'http://157.254.193.139:80',
    'http://190.61.88.147:80',
    'http://103.152.112.145:80',
    'http://8.209.198.247:80',
    'http://143.198.228.250:80',
    'http://167.99.124.118:80',
    'http://162.223.94.163:80',
    'http://143.244.182.101:80',
    'http://3.220.76.84:80',
    'http://203.198.207.253:80',
    'http://139.99.135.214:80',
    'http://74.208.51.197:5000',
];
const lastProxies = new Map();
const previousTranslations = new Map();
async function translate(inputText, options = {}) {
    try {
        options.from ??= 'auto';
        options.to ??= 'auto';
        const translationKey = `${inputText}-${options.from}-${options.to}`;
        const previousTranslation = previousTranslations.get(translationKey);
        if (previousTranslation)
            return previousTranslation;
        if (!options.fetchOptions?.agent) {
            options.fetchOptions ??= {};
            options.fetchOptions.agent = getProxy();
        }
        const translation = await (0, google_translate_api_1.translate)(inputText, options);
        previousTranslations.set(translationKey, translation);
        const definedLanguageTranslationKey = `${inputText}-${translation.raw.ld_result.srclangs[0]}-${options.to}`;
        previousTranslations.set(definedLanguageTranslationKey, translation);
        return translation;
    }
    catch (error) {
        if (error instanceof Error && pixoll_commando_1.Util.equals(error.name, ['TooManyRequestsError', 'FetchError', 'BadGatewayError'])) {
            const agent = getProxy(true);
            return await translate(inputText, {
                ...options,
                fetchOptions: { agent },
            });
        }
        throw error;
    }
}
exports.translate = translate;
function getProxy(fromError = false) {
    if (lastProxies.size === availableProxyUrls.length) {
        lastProxies.clear();
    }
    const proxyUrl = availableProxyUrls.filter(proxy => fromError ? !lastProxies.has(proxy) : true)[0];
    const existing = lastProxies.get(proxyUrl);
    if (existing)
        return existing;
    const proxy = (0, http_proxy_agent_1.default)(proxyUrl);
    lastProxies.set(proxyUrl, proxy);
    return proxy;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3RyYW5zbGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx5RUFBMkU7QUFFM0Usd0VBQXdFO0FBQ3hFLHFEQUF1QztBQUd2QyxtREFBbUQ7QUFFbkQsTUFBTSxrQkFBa0IsR0FBRztJQUN2Qix5QkFBeUI7SUFDekIsd0JBQXdCO0lBQ3hCLDBCQUEwQjtJQUMxQix5QkFBeUI7SUFDekIsNEJBQTRCO0lBQzVCLHlCQUF5QjtJQUN6QiwwQkFBMEI7SUFDMUIseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6Qiw2QkFBNkI7SUFDN0IsNEJBQTRCO0lBQzVCLDBCQUEwQjtJQUMxQixzQkFBc0I7SUFDdEIsMkJBQTJCO0lBQzNCLDBCQUEwQjtJQUMxQix1QkFBdUI7SUFDdkIsd0JBQXdCO0lBQ3hCLDJCQUEyQjtJQUMzQix5QkFBeUI7SUFDekIsMkJBQTJCO0lBQzNCLHlCQUF5QjtJQUN6QiwyQkFBMkI7SUFDM0IsMEJBQTBCO0lBQzFCLDBCQUEwQjtJQUMxQiwyQkFBMkI7SUFDM0IsdUJBQXVCO0lBQ3ZCLDJCQUEyQjtJQUMzQiwwQkFBMEI7SUFDMUIsMkJBQTJCO0NBQzlCLENBQUM7QUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztBQUN0RCxNQUFNLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO0FBWTNELEtBQUssVUFBVSxTQUFTLENBQUMsU0FBaUIsRUFBRSxVQUE0QixFQUFFO0lBQzdFLElBQUk7UUFDQSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQztRQUN4QixPQUFPLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQztRQUV0QixNQUFNLGNBQWMsR0FBRyxHQUFHLFNBQVMsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNwRSxNQUFNLG1CQUFtQixHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNyRSxJQUFJLG1CQUFtQjtZQUFFLE9BQU8sbUJBQW1CLENBQUM7UUFFcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDO1lBQzVCLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO1NBQzNDO1FBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLGdDQUFZLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNELG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEQsTUFBTSw2QkFBNkIsR0FBRyxHQUFHLFNBQVMsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzVHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRSxPQUFPLFdBQVcsQ0FBQztLQUN0QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osSUFBSSxLQUFLLFlBQVksS0FBSyxJQUFJLHNCQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxFQUFFO1lBQzlHLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixPQUFPLE1BQU0sU0FBUyxDQUFDLFNBQVMsRUFBRTtnQkFDOUIsR0FBRyxPQUFPO2dCQUNWLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRTthQUMxQixDQUFDLENBQUM7U0FDTjtRQUNELE1BQU0sS0FBSyxDQUFDO0tBQ2Y7QUFDTCxDQUFDO0FBN0JELDhCQTZCQztBQUVELFNBQVMsUUFBUSxDQUFDLFNBQVMsR0FBRyxLQUFLO0lBQy9CLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7UUFDaEQsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZCO0lBQ0QsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQy9DLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLElBQUksUUFBUTtRQUFFLE9BQU8sUUFBUSxDQUFDO0lBRTlCLE1BQU0sS0FBSyxHQUFHLElBQUEsMEJBQW9CLEVBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakMsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyJ9