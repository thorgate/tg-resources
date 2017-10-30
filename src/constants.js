import { parseErrors, prepareError } from './validationError';


const DEFAULTS = {
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
};

export default DEFAULTS;
