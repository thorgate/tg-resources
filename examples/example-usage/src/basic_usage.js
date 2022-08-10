/* eslint-disable no-console */
import { listen, getHostUrl } from '@tg-resources/test-server';
import { Router } from 'tg-resources';
import { SuperAgentResource } from '@tg-resources/superagent';

const server = listen(3003);

const api = new Router(
    {
        dogs: new SuperAgentResource('/dogs'),
        dog: new SuperAgentResource('/dogs/${pk}'),
    },
    {
        apiRoot: getHostUrl(3003),
    },
);

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
    await api.dog
        .fetch({ pk })
        .then(null, (error) => console.error(`${error}`));
};

export default () => example().then(() => server.close());
