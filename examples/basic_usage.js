/* eslint-disable no-console */
import Router, { Resource } from 'tg-resources';
import listen from '../test-server';

const server = listen();

const api = new Router({
    dogs: new Resource('/dogs'),
    dog: new Resource('/dogs/${pk}'),
}, {
    apiRoot: 'http://127.0.0.1:3001',
});

const example = async () => {
    // Create a dog, getting the pk from the response
    // PUT /dogs
    const { pk } = await api.dogs.put(null, { name: 'Lassie' });

    // The first argument takes url parameters
    // GET /dogs/${pk}
    const details = await api.dog.fetch({ pk });
    console.log('Dog:', details);

    // Rename the dog
    // PATCH /dogs/${pk}
    await api.dog.patch({ pk }, { name: 'Rin Tin Tin' });

    // Get rid of the dog
    // DELETE /dogs/${pk}
    await api.dog.del({ pk });

    // Error handling
    await api.dog.fetch({ pk }).then(null, error => console.error(`${error}`));
};

example().then(() => server.close());
