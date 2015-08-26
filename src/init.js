
const configuration = {
    API_BASE: '',
    getCsrfToken: null,
    getExtraHeaders: null,
    onSourceError: null
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

export function getCsrfToken() {
    const {getCsrfToken} = configuration;

    return getCsrfToken ? getCsrfToken() : '';
}

export function getExtraHeaders() {
    const {getExtraHeaders} = configuration;

    return getExtraHeaders ? getExtraHeaders() : [];
}

export function getOnSourceError() {
    const {onSourceError} = configuration;

    return onSourceError ? onSourceError : err => console.error(err);
}
