import { FetchResource } from '@tg-resources/fetch';
import { call } from 'redux-saga/effects';

import { resourceEffectFactory, resourceSagaRunner, SagaResource } from '../src';


let sagaResource: SagaResource<FetchResource>;
let resource: FetchResource;


beforeEach(() => {
    sagaResource = new SagaResource('/test', null, FetchResource);
    resource = sagaResource.resource;
});

const createFetchEffect = (options: any = {}) => (
    call(
        resourceSagaRunner,
        resource,
        'fetch',
        options,
    )
);

const createPostEffect = (options: any = {}) => (
    call(
        resourceSagaRunner,
        resource,
        'post',
        options,
    )
);

describe('resourceEffectFactory works', () => {
    test('resourceEffectFactory :: initializeSaga=true', () => {
        expect(() => {
            resourceEffectFactory(sagaResource, 'fetch', { requestConfig: { initializeSaga: true } });
        }).toThrow(/InitializeSaga is not supported/);
    });

    test('resourceEffectFactory :: method=unknown', () => {
        expect(() => {
            resourceEffectFactory(sagaResource, 'unknown');
        }).toThrow(/Unknown method used/);
    });

    test('resourceEffectFactory :: SagaResource :: fetch', () => {
        expect(resourceEffectFactory(sagaResource, 'fetch')).toEqual(createFetchEffect({
            kwargs: null,
            query: null,
            requestConfig: null,
        }));
    });

    test('resourceEffectFactory :: SagaResource :: post', () => {
        expect(resourceEffectFactory(sagaResource, 'post')).toEqual(createPostEffect({
            kwargs: null,
            query: null,
            requestConfig: null,
            data: null,
            attachments: null,
        }));
    });

    test('resourceEffectFactory :: Resource :: fetch', () => {
        expect(resourceEffectFactory(resource, 'fetch')).toEqual(createFetchEffect());
    });

    test('resourceEffectFactory :: Resource :: post', () => {
        expect(resourceEffectFactory(resource, 'post')).toEqual(createPostEffect());
    });
});
