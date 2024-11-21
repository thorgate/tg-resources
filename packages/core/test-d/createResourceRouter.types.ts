import { expectType } from 'tsd';

import {
    createTypedRouter,
    ResourceInterface,
} from '../src';
import { DummyResource } from '../src/DummyResource';

interface Animal {
    id: number;
    name: string;
}

const api = createTypedRouter({
    resource: DummyResource,
    config: {
        apiRoot: '/api/v1', // Set api root
    },
    routerBuilder: (builder) => ({
        auth: builder.resource<null, { authenticated: boolean }>([
            '/headers',
            { headers: () => ({ auth: 'foo' }), withCredentials: true },
        ]),
        cats: builder.resource<null, Animal[], Animal, Animal>({
            apiEndpoint: '/cats',
        }),
        cat: builder.resource<{ pk: number }, Animal, Animal>('/cats/${pk}'),
        dogs: builder.router((dogBuilder) => ({
            list: dogBuilder.resource<
                null,
                Animal[],
                Omit<Animal, 'id'>,
                Animal
            >('/dogs/'),
            details: dogBuilder.resource<{ pk: number }, Animal, Animal>(
                '/dogs/${pk}'
            ),
        })),
    }),
});

// -------------------------------------------------------------------------------------

expectType<
    ResourceInterface<
        null,
        { authenticated: boolean },
        any,
        { authenticated: boolean }
    >
>(api.auth);

expectType<ResourceInterface<null, Animal[], Omit<Animal, 'id'>, Animal>>(
    api.cats
);

expectType<ResourceInterface<{ pk: number }, Animal, Animal, Animal>>(
    api.cat
);

expectType<ResourceInterface<null, Animal[], Omit<Animal, 'id'>, Animal>>(
    api.dogs.list
);

expectType<ResourceInterface<{ pk: number }, Animal, Animal, Animal>>(
    api.dogs.details
);
