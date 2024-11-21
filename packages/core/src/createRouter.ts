import { isObject, isString } from '@tg-resources/is';

import { Resource } from './resource';
import { Router } from './router';
import {
    createResource,
    CreateResourceFactory,
    isResourceConstructorObject,
    isResourceTuple,
    ResourceClassConstructor,
    ResourceConstructorObject,
    ResourceTuple,
} from './router-builder';
import { ObjectMap, RouteConfig } from './types';

export type ResourceOrExtendedRouter<
    T,
    Klass extends Resource<any, any, any, any>
> = {
    [P in keyof T]: T[P] extends string
        ? Klass // If string, map as Resource
        : T[P] extends ResourceTuple
        ? Klass // If Resource tuple, map as Resource
        : T[P] extends ResourceConstructorObject
        ? Klass // If Resource constructor object, map as Resource
        : T[P] extends Router
        ? Router // If Router type, map router info to top level
        : Router & ResourceOrExtendedRouter<T[P], Klass>; // Default to recursive mapping
};

export function createRouter<
    Klass extends Resource<any, any, any, any>,
    T extends ObjectMap = Record<string, unknown>,
    InstanceKlass extends Resource<any, any, any, any> = Klass
>(
    routes: T,
    config: RouteConfig,
    resourceKlass: ResourceClassConstructor<Klass>,
    createResourceFactory?: CreateResourceFactory<InstanceKlass>
) {
    const routeMap: {
        [key: string]: Router | Resource<any, any, any, any>;
    } = {};

    const resourceFactory = createResourceFactory || createResource;

    Object.keys(routes).forEach((key) => {
        if (routes[key] instanceof Router) {
            routeMap[key] = routes[key];
        } else if (isString(routes[key])) {
            routeMap[key] = resourceFactory(
                resourceKlass,
                routes[key] as string,
                null
            );
        } else if (isResourceTuple(routes[key])) {
            const [apiEndpoint, resourceConfig] = routes[key] as ResourceTuple;
            routeMap[key] = resourceFactory(
                resourceKlass,
                apiEndpoint,
                resourceConfig
            );
        } else if (isResourceConstructorObject(routes[key])) {
            const { apiEndpoint, ...resourceConfig } = routes[
                key
            ] as ResourceConstructorObject;
            routeMap[key] = resourceFactory(
                resourceKlass,
                apiEndpoint,
                resourceConfig
            );
        } else if (isObject(routes[key])) {
            routeMap[key] = createRouter(
                routes[key],
                null,
                resourceKlass,
                resourceFactory
            );
        } else {
            const types = [
                'string',
                '[string, config]',
                '{apiEndpoint: string, ..config}',
                'Router',
            ].join(',');
            throw new Error(
                `Unknown type used "${key}", one of [${types}] is allowed`
            );
        }
    });

    return new Router(routeMap, config) as Router &
        ResourceOrExtendedRouter<T, InstanceKlass>;
}
