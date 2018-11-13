/* eslint-disable no-unused-vars, no-console */
import { listen, getHostUrl } from '@tg-resources/test-server';
import { Router, parseErrors, prepareError } from 'tg-resources';
import { SuperAgentResource as Resource } from '@tg-resources/superagent';

const server = listen(3005);


const api = new Router({
    dogs: new Resource('/dogs'),
    dog: new Resource('/dogs/${pk}'),

    // Nested router
    hello: new Router({
        world: new Resource('/hello'),
    }),
}, {
    apiRoot: getHostUrl(3005),
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
    prepareError,
});


const example = async () => {
    const { pk } = await api.dogs.put(null, { name: 'Lassie' });
    await api.dog.fetch({ pk });

    const { message, responseMutated } = await api.hello.world.fetch();
    console.log(`Hello ${message}! Mutated: ${responseMutated}`);
};

export default () => example().then(() => server.close());
