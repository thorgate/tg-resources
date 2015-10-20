const configuration = {
    API_BASE: '',
    getExtraHeaders: null,
    getCookies: null,
    onSourceError: null,
    parseErrors: null,
    ValidationErrorExtras: {}
};

export function setConfig(key, value) {
    configuration[key] = value;
}

export function getConfig(key) {
    if (key) {
        return configuration[key];
    }

    return configuration;
}

export function getExtraHeaders() {
    const {getExtraHeaders} = configuration;

    return getExtraHeaders ? getExtraHeaders() : {};
}

export function getCookies() {
    const {getCookies} = configuration;

    return getCookies ? getCookies() : null;
}

export function getOnSourceError() {
    const {onSourceError} = configuration;

    return onSourceError ? onSourceError : err => console.error(err);
}
