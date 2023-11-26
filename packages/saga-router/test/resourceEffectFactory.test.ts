import { FetchResource } from '@tg-resources/fetch';
import { call } from 'redux-saga/effects';

import {
    resourceEffectFactory,
    resourceSagaRunner,
    SagaResource,
} from '../src';

let sagaResource: SagaResource<FetchResource>;
let resource: FetchResource;

beforeEach(() => {
    sagaResource = new SagaResource('/test', null, FetchResource);
    resource = sagaResource.resource;
});

const createFetchEffect = (options: any = {}) =>
    call(resourceSagaRunner, resource, 'get', options);

const createPostEffect = (options: any = {}) =>
    call(resourceSagaRunner, resource, 'post', options);

describe('resourceEffectFactory works', () => {
    test('resourceEffectFactory :: method=unknown', () => {
        expect(() => {
            resourceEffectFactory(sagaResource, 'unknown');
        }).toThrow(/Unknown method used/);
    });

    test('resourceEffectFactory :: SagaResource :: getEffect', () => {
        expect(resourceEffectFactory(sagaResource, 'getEffect')).toEqual(
            createFetchEffect({
                kwargs: null,
                query: null,
                requestConfig: null,
            })
        );
    });

    test('resourceEffectFactory :: SagaResource :: postEffect', () => {
        expect(resourceEffectFactory(sagaResource, 'postEffect')).toEqual(
            createPostEffect({
                kwargs: null,
                query: null,
                requestConfig: null,
                data: null,
                attachments: null,
            })
        );
    });

    test('resourceEffectFactory :: Resource :: get', () => {
        expect(resourceEffectFactory(resource, 'get')).toEqual(
            createFetchEffect()
        );
    });

    test('resourceEffectFactory :: Resource :: post', () => {
        expect(resourceEffectFactory(resource, 'post')).toEqual(
            createPostEffect()
        );
    });
});
