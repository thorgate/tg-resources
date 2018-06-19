/* eslint-disable no-unused-vars, no-console */
import Router, { Resource, parseErrors, prepareErrors } from 'tg-resources';
import listen from '../test-server';

const server = listen();


const api = new Router({
    dogs: new Resource('/dogs'),
    dog: new Resource('/dogs/${pk}'),

    // Nested router
    hello: new Router({
        world: new Resource('/hello'),
    }),
}, {
    apiRoot: 'http://127.0.0.1:3001',
    headers: { 'X-Hello': 'World' },

    // Add additional cookie to request (ignored by most modern browsers)
    cookies: { hello: 'world' },

    mutateResponse: (responseData, rawResponse, resource, requestConfig) => ({ ...responseData, responseMutated: true }),
    mutateError: (error, rawResponse, resource, requestConfig) => error,
    mutateRawResponse: (rawResponse, requestConfig) => rawResponse,

    statusSuccess: [200, 201, 204],
    statusValidationError: [400],
    defaultAcceptHeader: 'application/json',
    withCredentials: false,

    parseErrors,
    prepareErrors,
});


const example = async () => {
    const { pk } = await api.dogs.put(null, { name: 'Lassie' });
    await api.dog.fetch({ pk });

    const { message, responseMutated } = await api.hello.world.fetch();
    console.log(`Hello ${message}! Mutated: ${responseMutated}`);
};

example().then(() => server.close());
