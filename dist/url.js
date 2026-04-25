export function buildApiUrl(baseUrl, ...args) {
    let paths = [];
    let options = {};
    if (args.length > 0) {
        const lastArg = args[args.length - 1];
        const isOptionsObject = lastArg != null &&
            typeof lastArg === 'object' &&
            !Array.isArray(lastArg) &&
            !(lastArg instanceof Date);
        if (isOptionsObject) {
            options = lastArg;
            paths = args.slice(0, -1);
        }
        else {
            paths = args;
        }
    }
    const { encode = true, allowEmpty = false, validate = true, query, hash, } = options;
    if (!baseUrl || typeof baseUrl !== 'string') {
        throw new Error('Base URL must be a non-empty string');
    }
    const trimmedBase = baseUrl.trim();
    if (!trimmedBase) {
        throw new Error('Base URL cannot be empty or whitespace');
    }
    let urlObj;
    try {
        urlObj = new URL(trimmedBase);
    }
    catch {
        throw new Error(`Invalid base URL: ${trimmedBase}`);
    }
    const basePath = urlObj.pathname.replace(/\/+$/, '');
    const normalizedPaths = paths
        .filter((path) => {
        if (path == null)
            return false;
        if (path === '' && !allowEmpty)
            return false;
        return true;
    })
        .map((path) => {
        if (typeof path !== 'string') {
            throw new Error(`Path segment must be a string, got ${typeof path}`);
        }
        return path.trim();
    })
        .filter((path) => (allowEmpty ? path !== null : path))
        .map((path) => {
        const normalized = path.replace(/^\/+|\/+$/g, '');
        if (!encode) {
            return normalized;
        }
        return normalized
            .split('/')
            .filter((segment) => allowEmpty || segment)
            .map((segment) => {
            try {
                segment = decodeURIComponent(segment);
            }
            catch {
                // Keep malformed escaped segments as-is before encoding.
            }
            return encodeURIComponent(segment).replace(/%2F/g, '/');
        })
            .join('/');
    })
        .filter((path) => allowEmpty || path);
    const fullPath = normalizedPaths.length > 0
        ? `${basePath}/${normalizedPaths.join('/')}`
        : basePath;
    urlObj.pathname = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value != null) {
                urlObj.searchParams.append(key, String(value));
            }
        });
    }
    if (hash) {
        urlObj.hash = hash.startsWith('#') ? hash : `#${hash}`;
    }
    const finalUrl = urlObj.toString();
    if (validate) {
        try {
            new URL(finalUrl);
        }
        catch {
            throw new Error(`Generated invalid URL: ${finalUrl}`);
        }
    }
    return finalUrl;
}
export function createUrlBuilder(baseUrl) {
    return (...args) => buildApiUrl(baseUrl, ...args);
}
//# sourceMappingURL=url.js.map