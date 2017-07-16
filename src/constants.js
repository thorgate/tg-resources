import { ValidationError } from './errors';


const DEFAULTS = {
    apiRoot: '',
    mutateResponse: null,
    mutateError: null,
    headers: null,
    cookies: null,

    prepareError: ValidationError.defaultPrepareError,
    parseErrors: ValidationError.defaultParseErrors,

    statusSuccess: [200, 201, 204],
    statusValidationError: [400],

    defaultAcceptHeader: 'application/json',
};

export default DEFAULTS;
