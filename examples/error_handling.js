/* eslint-disable no-console */
import Router, { Resource } from 'tg-resources';
import listen from '../test-server';

const server = listen();

const api = new Router({
    serverError: new Resource('/error500'),
    networkError: new Resource('/errorNetwork'),
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

const example = async () => {
    // The three main types of error, network, server and validation
    await api.networkError.fetch().then(null, errorHandler);
    await api.serverError.fetch().then(null, errorHandler);
    await api.dogs.put(null, { hello: 'world' }).then(null, errorHandler);


    await api.dogs.put(null, { hello: 'world' }).then(null, (error) => {
        // The errors are iterable
        error.errors.map(x => console.error(`${x.fieldName}: ${x}`));

        // And we can get a specific error
        console.error('name:', error.errors.getError('name'));
    });
};

example().then(() => server.close());
