// eslint-disable-next-line import/no-extraneous-dependencies
import { ResourceTuple } from '@tg-resources/core';
import { FetchResource } from '@tg-resources/fetch';
import { expectType } from 'tsd';
import { createSagaRouter, SagaResource } from '../src';

const apiRouter = createSagaRouter(
    {
        auth: [
            '/headers',
            { headers: () => ({ auth: 'foo' }), withCredentials: true },
        ] as ResourceTuple,
        cats: {
            apiEndpoint: '/cats',
        },
        cat: '/cats/${pk}',
        cat2: new SagaResource('/cats/${pk}', null, FetchResource),
        dogs: {
            list: '/dogs/',
            details: '/dogs/${pk}',
        },
    },
    {
        apiRoot: '/api',
    },
    FetchResource
);

// -------------------------------------------------------------------------------------

expectType<
    SagaResource<FetchResource<any, any, any, any>, any, any, any, any>
>(apiRouter.auth);

expectType<
    SagaResource<FetchResource<any, any, any, any>, any, any, any, any>
>(apiRouter.cats);

expectType<
    SagaResource<FetchResource<any, any, any, any>, any, any, any, any>
>(apiRouter.cat);

expectType<
    SagaResource<FetchResource<any, any, any, any>, any, any, any, any>
>(apiRouter.cat2);

expectType<
    SagaResource<FetchResource<any, any, any, any>, any, any, any, any>
>(apiRouter.dogs.list);

expectType<
    SagaResource<FetchResource<any, any, any, any>, any, any, any, any>
>(apiRouter.dogs.details);
