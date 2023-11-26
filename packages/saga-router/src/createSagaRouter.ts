import {
    CreateResourceFactory,
    createRouter,
    ObjectMap,
    Resource,
    ResourceClassConstructor,
    ResourceOrExtendedRouter,
    RouteConfig,
    Router,
} from '@tg-resources/core';

import { SagaResource } from './SagaResource';
import { SagaRouteConfig } from './types';

type SagaResourceOrExtendedRouter<
    T,
    Klass extends Resource<any, any, any, any>
> = ResourceOrExtendedRouter<T, SagaResource<Klass, any, any, any, any>>;

export const createSagaResource: CreateResourceFactory<
    SagaResource<Resource<any, any, any, any>, any, any, any, any>
> = <Klass extends Resource<any, any, any, any>>(
    resourceKlass: ResourceClassConstructor<Klass>,
    apiEndpoint: string,
    config?: RouteConfig
) => new SagaResource<Klass>(apiEndpoint, config || null, resourceKlass);

export function createSagaRouter<
    Klass extends Resource<any, any, any, any>,
    T extends ObjectMap = Record<string, unknown>
>(
    routes: T,
    config: SagaRouteConfig | null,
    resource: ResourceClassConstructor<Klass>
) {
    const router = createRouter<
        Klass,
        T,
        SagaResource<Resource<any, any, any, any>, any, any, any, any>
    >(routes, config, resource, createSagaResource);

    // Return correct typing for SagaResource
    // otherwise it will be typed as Resource which we do not want
    return router as Router & SagaResourceOrExtendedRouter<T, Klass>;
}
