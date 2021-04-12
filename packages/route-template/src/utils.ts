import { isFunction } from '@tg-resources/is';

import { RouteTemplate } from './types';

export function cleanRoot(path: string): string {
    let currentPath = `${path}`;

    if (currentPath.endsWith('/')) {
        currentPath = currentPath.slice(0, -1);
    }

    return currentPath;
}

export function cleanRoute(path: string): string {
    let currentPath = `${path}`;

    if (currentPath.startsWith('/')) {
        currentPath = currentPath.slice(1);
    }

    return currentPath;
}

export function withKwargs<TKwargs>() {
    return (kwargs: TKwargs) => kwargs;
}

export function isRouteTemplate(value: any): value is RouteTemplate<any> {
    return (
        isFunction(value) &&
        typeof value.routePath === 'string' &&
        isFunction(value.configure)
    );
}
