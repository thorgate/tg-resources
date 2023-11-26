import { isString } from '@tg-resources/is';

import { Resource } from '../resource';
import { Router } from '../router';
import {
    Kwargs,
    ObjectMap,
    ResourceInterface,
    RouteConfig,
    RouteMap,
    RouterDefinition,
} from '../types';

import {
    ResourceClassConstructor,
    ResourceConstructorObject,
    ResourceTuple,
    RouterBuilderInterface,
} from './types';
import {
    createResource,
    isResourceConstructorObject,
    isResourceTuple,
} from './utils';

export class RouterBuilder<Klass extends Resource<any, any, any, any>>
    implements RouterBuilderInterface<Klass>
{
    public readonly resourceKlass: ResourceClassConstructor<Klass>;

    constructor(resourceKlass: ResourceClassConstructor<Klass>) {
        this.resourceKlass = resourceKlass;
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
            return createResource(
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
            return createResource(
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

            return createResource(
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
        builder: (build: this) => TRouteMap,
        config: RouteConfig | null = null
    ): RouterDefinition<TRouteMap> {
        const definition = builder(this);

        return new Router(definition, config) as Router & TRouteMap;
    }
}
