import { isWrapperResource, Resource, Router } from '@tg-resources/core';
import LRUCache from 'lru-cache';
import React, { useMemo } from 'react';

import {
    ReactResourceProviderProps,
    RouterContextProvidedProps,
} from '../types';
import { ReactResourcesContext } from './Context';

function resolveResource(router: Router, routeName: string): Resource {
    const path = routeName.split('.');

    let current: Router | Resource | null = null;

    path.forEach(key => {
        if (!current) {
            current = router[key];
        } else if (current instanceof Router) {
            current = current[key];
        } else if (current instanceof Resource) {
            throw new Error('Resource cannot contain resource!');
        }
    });

    if (!current) {
        throw new Error(`Resource for "${routeName}" was not found!`);
    }

    if ((current as any) instanceof Router) {
        throw new Error(`Resource for "${routeName}" is a router.`);
    }

    if (isWrapperResource(current)) {
        throw new Error(
            `Resource for "${routeName}" is wrapped resource. Only native resources are supported!`
        );
    }

    return current;
}

// TODO: Add cache interface here - then can avoid running request or still run request and set initial value
export const ReactResourceProvider = <TRouter extends Router>({
    children,
    router,
}: ReactResourceProviderProps<TRouter>) => {
    const contextValue = useMemo<RouterContextProvidedProps>(
        () => ({
            router,
            cache: new LRUCache<string, any>(),
            resolveResource: routeName => resolveResource(router, routeName),
        }),
        [router]
    );
    return (
        <ReactResourcesContext.Provider value={contextValue}>
            {children}
        </ReactResourcesContext.Provider>
    );
};
