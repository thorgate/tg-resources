import { expectType } from 'tsd';

import { createRouter, Kwargs, ResourceTuple } from '../src';
import { DummyResource } from '../src/DummyResource';

const apiRouter = createRouter(
    {
        auth: [
            '/headers',
            { headers: () => ({ auth: 'foo' }), withCredentials: true },
        ] as ResourceTuple,
        cats: {
            apiEndpoint: '/cats',
        },
        cat: '/cats/${pk}',
        cat2: new DummyResource('/cats/${pk}'),
        dogs: {
            list: '/dogs/',
            details: '/dogs/${pk}',
        },
    },
    {
        apiRoot: '/api/v1', // Set api root
    },
    DummyResource
);

// -------------------------------------------------------------------------------------

expectType<DummyResource<Kwargs | null, any, any, any>>(apiRouter.auth);

expectType<DummyResource<Kwargs | null, any, any, any>>(apiRouter.cats);

expectType<DummyResource<Kwargs | null, any, any, any>>(apiRouter.cat);

expectType<DummyResource<Kwargs | null, any, any, any>>(apiRouter.cat2);

expectType<DummyResource<Kwargs | null, any, any, any>>(apiRouter.dogs.list);

expectType<DummyResource<Kwargs | null, any, any, any>>(apiRouter.dogs.details);

// -------------------------------------------------------------------------------------

expectType<Promise<any>>(apiRouter.cats.fetch({ ad: 1 }));
expectType<Promise<any>>(apiRouter.cat.fetch({ ad: 1 }));
expectType<Promise<any>>(apiRouter.cat2.fetch({ ad: 1 }));
