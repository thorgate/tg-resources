import { isObject, isString } from '@tg-resources/is';

import { Router } from './router';
import { RequestConfig, ResourceInterface } from './types';


export interface CreateRouterMap {
    [key: string]: string | CreateRouterMap;
}


interface RouterMap {
    [key: string]: Router | ResourceInterface;
}

type ResourceOrExtendedRouter<T> = {
    [P in keyof T]: T[P] extends string ? ResourceInterface : ResourceOrExtendedRouter<T[P]>
};


export function createRouter<
    T extends CreateRouterMap, Klass extends ResourceInterface
>(routes: T, config: RequestConfig, resourceKlass: { new(apiEndpoint: string, config: RequestConfig): Klass }) {
    const routeMap: RouterMap = {};

    Object.keys(routes).forEach((key) => {
        if (isString(routes[key])) {
            routeMap[key] = new resourceKlass((routes[key] as string), config);
        } else if (isObject(routes[key])) {
            routeMap[key] = createRouter((routes[key] as CreateRouterMap), null, resourceKlass);
        }
    });

    return new Router(routeMap, config) as Router & ResourceOrExtendedRouter<T>;
}
