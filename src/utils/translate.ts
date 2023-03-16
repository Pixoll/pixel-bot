import { translate as bingTranslate, TranslationResult } from 'bing-translate-api';
import { BingLanguageId } from './constants';

/**
 * Translate text through [Bing Translator](https://bing.com/translator)
 * @param inputText The text to be translated, can't be blank. The **maximum** text length is **1000**.
 * @param options Translation options
 */
export async function translate(inputText: string, options: TranslateOptions = {}): Promise<TranslationResult> {
    options.to ??= 'en';
    const translation = await bingTranslate(inputText, options.from, options.to, options.correct, options.raw);
    return translation;
}

export interface TranslateOptions {
    /**
     * The language code of source text.
     * @default 'auto-detect'
     */
    from?: BingLanguageId | null;
    /**
     * The language in which the text should be translated.
     * @default 'en'
     */
    to?: BingLanguageId;
    /**
     * Whether to correct the input text. Note that:
     * 1. There is currently a **limit of 50 characters** for correction service.
     * 2. **Only
     * [the languages in this list](https://github.com/plainheart/bing-translate-api/blob/master/src/lang.js#L9-L30)**
     * are supported to be corrected.
     * @default false
     */
    correct?: boolean;
    /**
     * Whether the translation result contains raw response from Bing API.
     * @default false
     */
    raw?: boolean;
}
