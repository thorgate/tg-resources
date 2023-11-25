import { ConfigType } from './types';
import { parseErrors, prepareError } from './ValidationError';

const DEFAULTS: ConfigType = {
    apiRoot: '',
    mutateResponse: null,
    mutateError: null,
    mutateRawResponse: null,
    headers: null,
    cookies: null,
    withCredentials: false,

    parseErrors,
    prepareError,

    statusSuccess: [200, 201, 204],
    statusValidationError: [400],

    defaultAcceptHeader: 'application/json',

    allowAttachments: false,

    signal: null,

    useLodashTemplate: true,
};

export default DEFAULTS;
