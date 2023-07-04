import fetch from 'node-fetch';

const apiURL = 'https://api.mcstatus.io/v2';

type StatusAPIEndpoint = 'icon' | 'status/bedrock' | 'status/java';

export async function statusJava(host: string, port = 25565): Promise<JavaStatusResponse | null> {
    const start = Date.now();
    const status = await apiGet<JavaStatusResponse>('status/java', `${host}:${port}`);
    if (!status) return null;
    status.ping = Date.now() - start;
    return status;
}

export async function statusBedrock(host: string, port = 19132): Promise<BedrockStatusResponse | null> {
    const start = Date.now();
    const status = await apiGet<BedrockStatusResponse>('status/bedrock', `${host}:${port}`);
    if (!status) return null;
    status.ping = Date.now() - start;
    return status;
}

async function apiGet<T>(endpoint: StatusAPIEndpoint, address: string): Promise<T | null> {
    const requestURL = `${apiURL}/${endpoint}/${address}`;
    const response = await fetch(requestURL, {
        method: 'GET',
    });

    if (!response.ok) null;
    const json = await response.json() as T;
    return json;
}

export interface JavaStatusResponse {
    /** Determines whether the server is online or offline. */
    online: boolean;
    /** The hostname of the server that was resolved from the address string. */
    host: string;
    /** The port of the server that was resolved from the address string. */
    port: number;
    /** Roundtrip latency of the request. */
    ping: number;
    /**
     * Whether or not this server address has been blocked by Mojang.
     * If this is true, Notchian clients will not be able to connect to the
     * server via the Minecraft client because it previously violated the EULA.
     */
    eula_blocked: boolean;
    /**
     * The timestamp in Unix milliseconds of when the status was retrieved from
     * the Minecraft server itself.
     */
    retrieved_at: number;
    /**
     * The Unix milliseconds timestamp at which the cache will expire for this
     * status. The first proceeding request made after this timestamp will
     * return an up-to-date status of the server.
     */
    expires_at: number;
    /**
     * The version data of the server. This will be null if the server
     * version is pre-1.3.2. This property will be missing if the server
     * is offline.
     */
    version: {
        /**
         * The version name of the server, typically modified by the server
         * itself to show version range. This value may contain special formatting
         * characters.
         */
        name_raw: string;
        /**
         * The version name of the server, typically modified by the server
         * itself to show version range. This value will have all formatting
         * characters removed.
         */
        name_clean: string;
        /**
         * The version name of the server, typically modified by the server
         * itself to show version range, as an HTML string with proper
         * formatting applied.
         */
        name_html: string;
        /**
         * The protocol version of the server which is used to identify
         * what client versions are supported.
         */
        protocol: number;
    } | null;
    /**
     * Information about the amount of players online and *some* sample
     * players if provided. This property will be missing if the server
     * is offline.
     */
    players: {
        /** The amount of online players in the server. */
        online: number;
        /** The maximum number of allowed players in the server. */
        max: number;
        /**
         * Some sample players online in the server. Most (if not all) major
         * servers disable this or modify the data for custom formatting. If you
         * do not have any items in this array, it is because the server has
         * disabled sample players for a reason.
         */
        list: Array<{
            /** The UUID of the player logged into the server. */
            uuid: string;
            /**
             * The username of the player logged into the server. The server
             * may have plugins that modify this data to show special
             * formatting. This value may have formatting characters.
             */
            name_raw: string;
            /**
             * The username of the player logged into the server. The server
             * may have plugins that modify this data to show special
             * formatting. This value will not have any formatting characters.
             */
            name_clean: string;
            /**
             * The username of the player logged into the server, as an HTML
             * string with proper formatting applied.
             */
            name_html: string;
        }>;
    };
    /**
     * The message of the day (or MOTD/description) of the server. This is the
     * message shown below the server name in the client multiplayer menu. This
     * property will be missing if the server is offline.
     */
    motd: {
        /**
         * The raw MOTD with formatting codes. Refer to
         * https://minecraft.fandom.com/wiki/Formatting_codes for information
         * on how to use formatting codes.
         */
        raw: string;
        /** A clean text-only version of the MOTD with all formatting codes removed. */
        clean: string;
        /**
         * An HTML representation of the MOTD with proper formatting. All formatting
         * codes are supported and are equal to their value in the Minecraft fandom wiki.
         * Magic/obfuscated formatting codes are a <span> with the class `.minecraft-format-obfuscated`.
         * Line breaks are encoded as the "\n" escape code and may be replaced with <br> by the user.
         */
        html: string;
    };
    /**
     * The base64-encoded PNG data of the 64x64 server icon. You may require
     * additional libraries or utilities for using this property. There are
     * several examples out there. This property may be null if the server does
     * not set an icon image. This property will also be missing if the server
     * is offline.
     */
    icon: string | null;
    /**
     * Any Forge mods loaded if provided by the server. Most servers do not
     * have Forge installed so this property will be empty a majority of the time.
     * Legacy FML and FML2 are supported.
     */
    mods: Array<{
        /** The name of the mod that is loaded on the server. */
        name: string;
        /** The version of the mod that is loaded on the server. */
        version: string;
    }>;
}

export interface BedrockStatusResponse {
    /** Determines whether the server is online or offline. */
    online: boolean;
    /** The hostname of the server that was resolved from the address string. */
    host: string;
    /** The port of the server that was resolved from the address string. */
    port: number;
    /** Roundtrip latency of the request. */
    ping: number;
    /**
     * Whether or not this server address has been blocked by Mojang.
     * If this is true, Notchian clients will not be able to connect to the
     * server via the Minecraft client because it previously violated the EULA.
     */
    eula_blocked: boolean;
    /**
     * The timestamp in Unix milliseconds of when the status was retrieved from
     * the Minecraft server itself.
     */
    retrieved_at: number;
    /**
     * The Unix milliseconds timestamp at which the cache will expire for this
     * status. The first proceeding request made after this timestamp will
     * return an up-to-date status of the server.
     */
    expires_at: number;
    /**
     * The version data of the server. This property will be missing if
     * the server is offline.
     */
    version: {
        /** The version name of the server. */
        name: string;
        /**
         * The protocol version of the server which is used to identify
         * what client versions are supported.
         */
        protocol: number;
    };
    /**
     * Information about the amount of online and max players. This property
     * will be missing if the server is offline.
     */
    players: {
        /** The amount of online players in the server. */
        online: number;
        /** The maximum number of allowed players in the server. */
        max: number;
    };
    /**
     * The message of the day (or MOTD/description) of the server. This is the
     * message shown below the server name in the client multiplayer menu. This
     * property will be missing if the server is offline.
     */
    motd: {
        /**
         * The raw MOTD with formatting codes. Refer to
         * https://minecraft.fandom.com/wiki/Formatting_codes for information
         * on how to use formatting codes.
         */
        raw: string;
        /** A clean text-only version of the MOTD with all formatting codes removed. */
        clean: string;
        /**
         * An HTML representation of the MOTD with proper formatting. All formatting
         * codes are supported and are equal to their value in the Minecraft fandom wiki.
         * Magic/obfuscated formatting codes are a <span> with the class `.minecraft-format-obfuscated`.
         * Line breaks are encoded as the "\n" escape code and may be replaced with <br> by the user.
         */
        html: string;
    };
    /**
     * The default gamemode that players will spawn into when joining
     * the server.
     */
    gamemode: string;
    /** The ID of the server itself. There is little to no documentation
     * online about the use of this value.
     */
    server_id: string;
    /**
     * The type of server that was retrieved. Possible values are "MCPE" for
     * Bedrock and Pocket Edition, or "MCEE" for Education Edition.
     */
    edition: 'MCEE' | 'MCPE';
}
