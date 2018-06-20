/* eslint-disable no-console */
import Router, { Resource, ValidationError, ListValidationError, SingleValidationError } from 'tg-resources';
import listen from '../test-server';

const server = listen();

const api = new Router({
    serverError: new Resource('/error500'),
    networkError: new Resource('/errorNetwork'),
    errorNested: new Resource('/errorNested'),
    dogs: new Resource('/dogs'),
}, {
    apiRoot: 'http://127.0.0.1:3001',
});


const errorHandler = (error) => {
    if (error.isNetworkError) {
        // Network error occurred
        console.error({ type: 'NETWORK_FAILED', error });

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
        Object.keys(error.errors).forEach(
            key => traverseValidationError(error.errors[key], [...path, key]),
        );

    } else if (error instanceof ListValidationError) {
        // Errors for each object in a list of objects
        error.errors.map(
            (e, ix) => traverseValidationError(e, [...path, ix]),
        );

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
        error.errors.map(x => console.error(`${x.fieldName}: ${x}`));

        // And we can get a specific error
        console.error('name:', error.errors.getError('name'));
    });

    console.error('--- Nested validation errors ---');
    await api.errorNested.fetch().then(null, traverseValidationError);
};

example().then(() => server.close());
