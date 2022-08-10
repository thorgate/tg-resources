/* eslint-disable no-console */
import { listen, getHostUrl } from '@tg-resources/test-server';
import {
    createRouter,
    ValidationError,
    ListValidationError,
    SingleValidationError,
} from 'tg-resources';
import { SuperAgentResource as Resource } from '@tg-resources/superagent';

const server = listen(3004);

const api = createRouter(
    {
        serverError: '/error500',
        networkError: '/errorNetwork',
        errorNested: '/errorNested',
        dogs: '/dogs',
    },
    {
        apiRoot: getHostUrl(3004),
    },
    Resource,
);

const errorHandler = (error) => {
    if (error.isNetworkError) {
        // Network error occurred
        console.error({ type: 'NETWORK_FAILED', error });
    } else if (error.isAbortError) {
        // Request was aborted
        console.error({ type: 'ABORTED', error });
    } else if (error.isValidationError) {
        // Validation error occurred (e.g.: wrong credentials)
        console.error({ type: 'VALIDATION_ERROR', error });
    } else {
        // As a last resort, also handle invalid response codes
        console.error({ type: 'SERVER_ERROR', error });
    }
};

const traverseValidationError = (error, path = []) => {
    if (error.isValidationError) {
        // In the outermost error, a RequestValidationError
        traverseValidationError(error.errors);
    } else if (error instanceof ValidationError) {
        // ValidationError errors has an object with errors by field
        Object.keys(error.errors).forEach((key) =>
            traverseValidationError(error.errors[key], [...path, key]),
        );
    } else if (error instanceof ListValidationError) {
        // Errors for each object in a list of objects
        error.errors.map((e, ix) => traverseValidationError(e, [...path, ix]));
    } else if (error instanceof SingleValidationError) {
        // Deepest level, error messages for a specific field.
        console.error(path.join('.'), error.errors);
    }
};

const example = async () => {
    // The three main types of error, network, server and validation
    console.error('--- Main Errors ---');
    await api.networkError.fetch().then(null, errorHandler);
    await api.serverError.fetch().then(null, errorHandler);
    await api.dogs.put(null, { hello: 'world' }).then(null, errorHandler);

    console.error('--- Simple validation error ---');
    await api.dogs.put(null, { hello: 'world' }).then(null, (error) => {
        // The errors are iterable
        error.errors.map((x) => console.error(`${x.fieldName}: ${x}`));

        // And we can get a specific error
        console.error('name:', error.errors.getError('name'));
    });

    console.error('--- Nested validation errors ---');
    await api.errorNested.fetch().then(null, traverseValidationError);
};

export default () => example().then(() => server.close());
