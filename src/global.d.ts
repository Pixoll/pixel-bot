declare module 'better-ms' {
    /** Short/Long format for `value`. */
    export function ms(value: number, options?: { long: boolean }): string;
    /** Parse the given `value` and return milliseconds. */
    export function ms(value: string): number;

    /**
     * Parse milliseconds into an object.
     * @example
     * ```js
     * import { parseMs } from 'better-ms';
     * 
     * parseMs(1337000001);
     * //=> {
     * //     days: 15,
     * //     hours: 11,
     * //     minutes: 23,
     * //     seconds: 20,
     * //     milliseconds: 1,
     * //     microseconds: 0,
     * //     nanoseconds: 0
     * // }
     * ```
     */
    export function parseMs(ms: number): Readonly<TimeComponents>;

    /**
     * Convert milliseconds to a human readable string: `1337000000` → `15d 11h 23m 20s`.
     * @param ms - Milliseconds to humanize.
     * @example
     * ```js
     * import { prettyMs } from 'better-ms';
     * 
     * prettyMilliseconds(1337000000);
     * //=> '15d 11h 23m 20s'
     * 
     * prettyMilliseconds(1337);
     * //=> '1.3s'
     * 
     * prettyMilliseconds(133);
     * //=> '133ms'
     * 
     * // `compact` option
     * prettyMilliseconds(1337, { compact: true });
     * //=> '1s'
     * 
     * // `verbose` option
     * prettyMilliseconds(1335669000, { verbose: true });
     * //=> '15 days 11 hours 1 minute 9 seconds'
     * 
     * // `colonNotation` option
     * prettyMilliseconds(95500, { colonNotation: true });
     * //=> '1:35.5'
     * 
     * // `formatSubMilliseconds` option
     * prettyMilliseconds(100.400080, { formatSubMilliseconds: true });
     * //=> '100ms 400µs 80ns'
     * 
     * // Can be useful for time durations
     * prettyMilliseconds(new Date(2014, 0, 1, 10, 40) - new Date(2014, 0, 1, 10, 5));
     * //=> '35m'
     * ```
     */
    export function prettyMs(ms: number, options?: Partial<PrettyMsOptions>): string;

    /** Converts duration strings into ms and future dates. */
    export class Duration {
        /**
         * Create a new Duration instance.
         * @since 0.5.0
         * @param pattern - The string to parse.
         */
        public constructor(pattern: string);

        /**
         * The offset.
         * @since 0.5.0
         */
        public offset: number;
        /**
         * Get the date from now.
         * @since 0.5.0
         */
        public get fromNow(): Date;

        /**
         * Get the date from.
         * @since 0.5.0
         * @param date - The Date instance to get the date from.
         */
        public dateFrom(date: Date): Date;
        /**
         * Shows the user friendly duration of time between a period and now.
         * @since 0.5.0
         * @param earlier - The time to compare.
         * @param showIn - Whether the output should be prefixed.
         */
        public static toNow(earlier: Date | number | string, showIn?: boolean): string;
    }

    export interface PrettyMsOptions {
        /**
         * Number of digits to appear after the seconds decimal point.
         * @default 1
         */
        readonly secondsDecimalDigits: number;
        /**
         * Number of digits to appear after the milliseconds decimal point.
         * 
         * Useful in combination with [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime).
         * @default 0
         */
        readonly millisecondsDecimalDigits: number;
        /**
         * Keep milliseconds on whole seconds: `13s` → `13.0s`.
         * 
         * Useful when you are showing a number of seconds spent on an operation and don't want the width of the output
         * to change when hitting a whole number.
         * @default false
         */
        readonly keepDecimalsOnWholeSeconds: boolean;
        /**
         * Only show the first unit: `1h 10m` → `1h`.
         * 
         * Also ensures that `millisecondsDecimalDigits` and `secondsDecimalDigits` are both set to `0`.
         * @default false
         */
        readonly compact: boolean;
        /**
         * Number of units to show. Setting `compact` to `true` overrides this option.
         * @default Infinity
         */
        readonly unitCount: number;
        /**
         * Use full-length units: `5h 1m 45s` → `5 hours 1 minute 45 seconds`.
         * @default false
         */
        readonly verbose: boolean;
        /**
         * Show milliseconds separately. This means they won't be included in the decimal part of the seconds.
         * @default false
         */
        readonly separateMilliseconds: boolean;
        /**
         * Show microseconds and nanoseconds.
         * @default false
         */
        readonly formatSubMilliseconds: boolean;
        /**
         * Display time using colon notation: `5h 1m 45s` → `5:01:45`. Always shows time in at least minutes: `1s` → `0:01`
         * 
         * Useful when you want to display time without the time units, similar to a digital watch.
         * 
         * Setting `colonNotation` to `true` overrides the following options to `false`:
         * - `compact`
         * - `formatSubMilliseconds`
         * - `separateMilliseconds`
         * - `verbose`
         * @default false
         */
        readonly colonNotation: boolean;
    }

    export interface TimeComponents {
        years: number;
        months: number;
        weeks: number;
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        milliseconds: number;
        microseconds: number;
        nanoseconds: number;
    }
}

interface ObjectConstructor {
    keys<T extends object>(o: T): keyof T extends never ? string[] : Array<keyof T>;
    entries<T extends object>(o: T): Array<[keyof T, PropertiesOf<T>]>;
    fromEntries<A extends PropertyKey, B>(entries: Iterable<readonly [A, B]>): Record<A, B>;
}

interface Date {
    /**
     * Converts a date and time to a string by using the current or specified locale.
     * @param locales A locale string, array of locale strings, Intl.Locale object, or array of
     * Intl.Locale objects that contain one or more language or locale tags. If you include more
     * than one locale string, list them in descending order of priority so that the first entry
     * is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used.
     * @param options An object that contains one or more properties that specify comparison options.
     */
    toLocaleString(locales?: Locale, options?: Intl.DateTimeFormatOptions): string;
}

type Locale =
    | 'af'
    | 'am'
    | 'ar-AE'
    | 'ar-BH'
    | 'ar-DZ'
    | 'ar-EG'
    | 'ar-IQ'
    | 'ar-JO'
    | 'ar-KW'
    | 'ar-LB'
    | 'ar-LY'
    | 'ar-MA'
    | 'ar-OM'
    | 'ar-QA'
    | 'ar-SA'
    | 'ar-SY'
    | 'ar-TN'
    | 'ar-YE'
    | 'as'
    | 'az-AZ'
    | 'be'
    | 'bg'
    | 'bn'
    | 'bo'
    | 'bs'
    | 'ca'
    | 'cs'
    | 'cy'
    | 'da'
    | 'de-AT'
    | 'de-CH'
    | 'de-DE'
    | 'de-LI'
    | 'de-LU'
    | 'el'
    | 'en-AU'
    | 'en-BZ'
    | 'en-CA'
    | 'en-CB'
    | 'en-GB'
    | 'en-IE'
    | 'en-IN'
    | 'en-JM'
    | 'en-NZ'
    | 'en-PH'
    | 'en-TT'
    | 'en-US'
    | 'en-ZA'
    | 'es-AR'
    | 'es-BO'
    | 'es-CL'
    | 'es-CO'
    | 'es-CR'
    | 'es-DO'
    | 'es-EC'
    | 'es-ES'
    | 'es-GT'
    | 'es-HN'
    | 'es-MX'
    | 'es-NI'
    | 'es-PA'
    | 'es-PE'
    | 'es-PR'
    | 'es-PY'
    | 'es-SV'
    | 'es-UY'
    | 'es-VE'
    | 'et'
    | 'eu'
    | 'fa'
    | 'fi'
    | 'fo'
    | 'fr-BE'
    | 'fr-CA'
    | 'fr-CH'
    | 'fr-FR'
    | 'fr-LU'
    | 'gd-IE'
    | 'gd'
    | 'gn'
    | 'gu'
    | 'he'
    | 'hi'
    | 'hr'
    | 'hu'
    | 'hy'
    | 'id'
    | 'is'
    | 'it-CH'
    | 'it-IT'
    | 'ja'
    | 'kk'
    | 'km'
    | 'kn'
    | 'ko'
    | 'ks'
    | 'la'
    | 'lo'
    | 'lt'
    | 'lv'
    | 'mi'
    | 'mk'
    | 'ml'
    | 'mn'
    | 'mr'
    | 'ms-BN'
    | 'ms-MY'
    | 'mt'
    | 'my'
    | 'ne'
    | 'nl-BE'
    | 'nl-NL'
    | 'no-NO'
    | 'or'
    | 'pa'
    | 'pl'
    | 'pt-BR'
    | 'pt-PT'
    | 'rm'
    | 'ro-MO'
    | 'ro'
    | 'ru-MO'
    | 'ru'
    | 'sa'
    | 'sb'
    | 'sd'
    | 'si'
    | 'sk'
    | 'sl'
    | 'so'
    | 'sq'
    | 'sr-SP'
    | 'sv-FI'
    | 'sv-SE'
    | 'sw'
    | 'ta'
    | 'te'
    | 'tg'
    | 'th'
    | 'tk'
    | 'tn'
    | 'tr'
    | 'ts'
    | 'tt'
    | 'uk'
    | 'ur'
    | 'uz-UZ'
    | 'vi'
    | 'xh'
    | 'yi'
    | 'zh-CN'
    | 'zh-HK'
    | 'zh-MO'
    | 'zh-SG'
    | 'zh-TW'
    | 'zu';

type PropertiesOf<T extends object> = T[keyof T];

type DataType = NodeJS.ArrayBufferView | string;

type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

type Partialize<T extends object, K extends keyof T = keyof T, D extends boolean = true> =
    D extends true ? Destructure<Omit<T, K> & Partial<Pick<T, K>>> : Omit<T, K> & Partial<Pick<T, K>>;

type Require<T extends object, K extends keyof T = keyof T, D extends boolean = true> =
    D extends true ? Destructure<Omit<T, K> & Required<Pick<T, K>>> : Omit<T, K> & Required<Pick<T, K>>;

type RemoveNullish<T extends object, K extends keyof T = keyof T> = {
    [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

type Destructure<T> = { [P in keyof T]: T[P] };

type Dictionary<T> = Record<string, T | undefined>;

type Awaitable<T> = PromiseLike<T> | T;

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

type IfElse<T extends boolean, A, B = null> = T extends true ? A : B;

type AnyFunction = () => unknown;

type Nullable<T> = T | null | undefined;

interface TypeOfValuesMap {
    bigint: bigint;
    boolean: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    function: Function;
    number: number;
    object: object;
    string: string;
    symbol: symbol;
    undefined: undefined;
}

type TimestampType =
    | 'D'
    | 'd'
    | 'F'
    | 'f'
    | 'R'
    | 'T'
    | 't';
