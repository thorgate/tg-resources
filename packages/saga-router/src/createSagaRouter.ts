import { isObject, isString } from '@tg-resources/is';
import { CreateRouterMap, ResourceInterface, Router } from 'tg-resources';

import { SagaResource } from './SagaResource';
import { SagaRequestConfig } from './types';


interface RouterMap {
    [key: string]: Router | ResourceInterface;
}

type ResourceOrExtendedRouter<T> = {
    [P in keyof T]: T[P] extends string ? ResourceInterface : ResourceOrExtendedRouter<T[P]>
};

export function createSagaRouter<
    T extends CreateRouterMap, Klass extends ResourceInterface
>(
    routes: T,
    config: SagaRequestConfig,
    resourceKlass: { new(apiEndpoint: string, config: SagaRequestConfig): Klass },
) {
    const routeMap: RouterMap = {};

    Object.keys(routes).forEach((key) => {
        if (isString(routes[key])) {
            routeMap[key] = new SagaResource((routes[key] as string), resourceKlass, config);
        } else if (isObject(routes[key])) {
            routeMap[key] = createSagaRouter((routes[key] as CreateRouterMap), null, resourceKlass);
        } else {
            throw new Error('Only string or object is allowed');
        }
    });

    return new Router(routeMap, config) as Router & ResourceOrExtendedRouter<T>;
}
