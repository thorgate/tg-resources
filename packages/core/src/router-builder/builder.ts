import { isString } from '@tg-resources/is';

import { Resource } from '../resource';
import { Router } from '../router';
import {
    Kwargs,
    ObjectMap,
    ResourceInterface,
    RouteMap,
    RouterDefinition,
} from '../types';

import {
    CreateResourceFactory,
    ResourceClassConstructor,
    ResourceConstructorObject,
    ResourceTuple,
    RouterBuilderInterface,
} from './types';
import { isResourceConstructorObject, isResourceTuple } from './utils';

export class RouterBuilder<
    Klass extends Resource<any, any, any, any>,
    InstanceKlass extends Resource<any, any, any, any> = Klass
> implements RouterBuilderInterface
{
    private readonly resourceKlass: ResourceClassConstructor<Klass>;

    private readonly createResourceFactory: CreateResourceFactory<InstanceKlass>;

    constructor(
        resourceKlass: ResourceClassConstructor<Klass>,
        createResourceFactory: CreateResourceFactory<InstanceKlass>
    ) {
        this.resourceKlass = resourceKlass;
        this.createResourceFactory = createResourceFactory;
    }

    resource<
        Params extends Kwargs | null = Kwargs,
        TFetchResponse = any,
        TPostPayload extends ObjectMap | string | null = any,
        TPostResponse = TFetchResponse
    >(
        endpointConfig: ResourceTuple | ResourceConstructorObject | string
    ): ResourceInterface<Params, TFetchResponse, TPostPayload, TPostResponse> {
        if (isString(endpointConfig)) {
            return this.createResourceFactory(
                this.resourceKlass,
                endpointConfig,
                null
            ) as ResourceInterface<
                Params,
                TFetchResponse,
                TPostPayload,
                TPostResponse
            >;
        }

        if (isResourceTuple(endpointConfig)) {
            const [apiEndpoint, resourceConfig] =
                endpointConfig as ResourceTuple;
            return this.createResourceFactory(
                this.resourceKlass,
                apiEndpoint,
                resourceConfig
            ) as ResourceInterface<
                Params,
                TFetchResponse,
                TPostPayload,
                TPostResponse
            >;
        }

        if (isResourceConstructorObject(endpointConfig)) {
            const { apiEndpoint, ...resourceConfig } = endpointConfig;

            return this.createResourceFactory(
                this.resourceKlass,
                apiEndpoint,
                resourceConfig
            ) as ResourceInterface<
                Params,
                TFetchResponse,
                TPostPayload,
                TPostResponse
            >;
        }

        throw new Error('Invalid endpoint config');
    }

    router<TRouteMap extends RouteMap>(
        builder: (build: this) => TRouteMap
    ): RouterDefinition<TRouteMap> {
        const definition = builder(this);

        return new Router(definition) as Router & TRouteMap;
    }
}
