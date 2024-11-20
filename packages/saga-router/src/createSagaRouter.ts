import {
    CreateResourceFactory,
    createRouter,
    Kwargs,
    ObjectMap,
    Resource,
    ResourceClassConstructor,
    ResourceConstructorObject,
    ResourceTuple,
    RouteConfig,
    Router,
} from '@tg-resources/core';

import { SagaResource } from './SagaResource';
import { SagaRouteConfig } from './types';

// Was required to copy this here as well - Type matching did not work correctly otherwise
export type ResourceOrExtendedRouter<
    T,
    Klass extends Resource<Kwargs, any, any, any>
> = {
    [P in keyof T]: T[P] extends string
        ? SagaResource<Klass> // If string, map as Resource
        : T[P] extends ResourceTuple
        ? SagaResource<Klass> // If Resource tuple, map as Resource
        : T[P] extends ResourceConstructorObject
        ? SagaResource<Klass> // If Resource constructor object, map as Resource
        : T[P] extends Router
        ? Router // If Router type, map router info to top level
        : Router & ResourceOrExtendedRouter<T[P], Klass>; // Default to recursive mapping
};

export const createSagaResource: CreateResourceFactory = <
    Klass extends Resource
>(
    resourceKlass: ResourceClassConstructor<Klass>,
    apiEndpoint: string,
    config?: RouteConfig
) => new SagaResource<Klass>(apiEndpoint, config || null, resourceKlass);

export function createSagaRouter<
    Klass extends Resource,
    T extends ObjectMap = Record<string, unknown>
>(
    routes: T,
    config: SagaRouteConfig | null,
    resourceKlass: ResourceClassConstructor<Klass>
) {
    const router = createRouter(
        routes,
        config,
        resourceKlass,
        createSagaResource
    ) as any;

    // Return correct typing for SagaResource
    return router as Router & ResourceOrExtendedRouter<T, Klass>;
}
