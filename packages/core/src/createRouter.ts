import { isArray, isObject, isString } from '@tg-resources/is';

import { Resource } from './resource';
import { Router } from './router';
import { ConfigType, ObjectMap, OptionalMap, RequestConfig } from './types';


export type ResourceTuple<Config = OptionalMap<ConfigType>> = [string, Config];

export const isResourceTuple = (value: any): value is ResourceTuple => (
    isArray(value) && value.length === 2 && typeof value[0] === 'string' && isObject(value[1])
);


export interface ResourceConstructorObject extends OptionalMap<ConfigType> {
    apiEndpoint: string;
}

export const isResourceConstructorObject = (value: any): value is ResourceConstructorObject => (
    isObject(value) && 'apiEndpoint' in value
);


export type ResourceOrExtendedRouter<T, Klass extends Resource> = {
    [P in keyof T]:
        T[P] extends string ? Klass : // If string, map as Resource
        T[P] extends ResourceTuple ? Klass : // If Resource tuple, map as Resource
        T[P] extends ResourceConstructorObject ? Klass : // If Resource constructor object, map as Resource
        T[P] extends Router ? Router :  // If Router type, map router info to top level
        Router & ResourceOrExtendedRouter<T[P], Klass> // Default to recursive mapping
};


export interface ResourceClassConstructor<Klass> {
    new(apiEndpoint: string, config?: RequestConfig | null): Klass;
}


export type CreateResourceFactory = <
    Klass extends Resource
>(
    resourceKlass: ResourceClassConstructor<Klass>, apiEndpoint: string, config?: RequestConfig, options?: ObjectMap
) => any;


export const createResource: CreateResourceFactory = <
    Klass extends Resource
>(resourceKlass: ResourceClassConstructor<Klass>, apiEndpoint: string, config?: RequestConfig, _0?: ObjectMap): Klass => (
    new resourceKlass(apiEndpoint, config)
);


export function createRouter<
    Klass extends Resource, T extends ObjectMap = {}
>(
    routes: T, config: RequestConfig | null, resourceKlass: ResourceClassConstructor<Klass>,
    createResourceFactory: CreateResourceFactory = createResource
) {
    const routeMap: {
        [key: string]: Router | Resource;
    } = {};

    Object.keys(routes).forEach((key) => {
        if (routes[key] instanceof Router) {
            routeMap[key] = routes[key];

        } else if (isString(routes[key])) {
            routeMap[key] = createResourceFactory(resourceKlass, (routes[key] as string), null);

        } else if (isResourceTuple(routes[key])) {
            const [apiEndpoint, resourceConfig] = routes[key] as ResourceTuple;
            routeMap[key] = createResourceFactory(resourceKlass, apiEndpoint, resourceConfig);

        } else if (isResourceConstructorObject(routes[key])) {
            const { apiEndpoint, ...resourceConfig } = routes[key] as ResourceConstructorObject;
            routeMap[key] = createResourceFactory(resourceKlass, apiEndpoint, resourceConfig);

        } else if (isObject(routes[key])) {
            routeMap[key] = createRouter(routes[key], null, resourceKlass, createResourceFactory);

        } else {
            const types = [
                'string',
                '[string, config]',
                '{apiEndpoint: string, ..config}',
                '{ ...any }',
            ];
            throw new Error(`Unknown type used "${key}", one of [${types.join(',')}] is allowed`);
        }
    });

    return new Router(routeMap, config) as Router & ResourceOrExtendedRouter<T, Klass>;
}
