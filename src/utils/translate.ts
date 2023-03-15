import { translate as apiTranslate } from '@vitalets/google-translate-api';
import type { TranslateOptions as APITranslateOptions, RawResponse } from '@vitalets/google-translate-api/src/types';
import createHttpProxyAgent, { HttpProxyAgent } from 'http-proxy-agent';
import { Util } from 'pixoll-commando';
import { GoogleLanguageId } from './constants';

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
const lastProxies = new Map<string, HttpProxyAgent>();
const previousTranslations = new Map<string, TranslateResponse>();

export interface TranslateResponse {
    text: string;
    raw: RawResponse;
}

export interface TranslateOptions extends APITranslateOptions {
    from?: GoogleLanguageId;
    to?: GoogleLanguageId;
}

export async function translate(inputText: string, options: TranslateOptions = {}): Promise<TranslateResponse> {
    try {
        options.from ??= 'auto';
        options.to ??= 'auto';

        const translationKey = `${inputText}-${options.from}-${options.to}`;
        const previousTranslation = previousTranslations.get(translationKey);
        if (previousTranslation) return previousTranslation;

        if (!options.fetchOptions?.agent) {
            options.fetchOptions ??= {};
            options.fetchOptions.agent = getProxy();
        }

        const translation = await apiTranslate(inputText, options);
        previousTranslations.set(translationKey, translation);
        const definedLanguageTranslationKey = `${inputText}-${translation.raw.ld_result.srclangs[0]}-${options.to}`;
        previousTranslations.set(definedLanguageTranslationKey, translation);
        return translation;
    } catch (error) {
        if (error instanceof Error && Util.equals(error.name, ['TooManyRequestsError', 'FetchError', 'BadGatewayError'])) {
            const agent = getProxy(true);
            return await translate(inputText, {
                ...options,
                fetchOptions: { agent },
            });
        }
        throw error;
    }
}

function getProxy(fromError = false): HttpProxyAgent {
    if (lastProxies.size === availableProxyUrls.length) {
        lastProxies.clear();
    }
    const proxyUrl = availableProxyUrls.filter(proxy =>
        fromError ? !lastProxies.has(proxy) : true
    )[0];
    const existing = lastProxies.get(proxyUrl);
    if (existing) return existing;

    const proxy = createHttpProxyAgent(proxyUrl);
    lastProxies.set(proxyUrl, proxy);
    return proxy;
}
