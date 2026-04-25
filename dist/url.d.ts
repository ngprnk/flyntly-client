export interface BuildUrlOptions {
    encode?: boolean;
    allowEmpty?: boolean;
    validate?: boolean;
    query?: Record<string, string | number | boolean | null | undefined>;
    hash?: string;
}
export type BuildUrlArg = string | BuildUrlOptions;
export declare function buildApiUrl(baseUrl: string, ...args: BuildUrlArg[]): string;
export declare function createUrlBuilder(baseUrl: string): (...args: BuildUrlArg[]) => string;
//# sourceMappingURL=url.d.ts.map