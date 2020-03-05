import {
    FetchOptions,
    PostOptions,
    Resource,
    ResourceErrorInterface,
    Router,
} from '@tg-resources/core';
import { Kwargs, ObjectMap, ResourcePostMethods } from '@tg-resources/types';
import LRUCache from 'lru-cache';
import { ReactNode } from 'react';

export enum CachingPolicy {
    CacheFirst = 'cache-first',
    CacheOnly = 'cache-only',
    NetworkFirst = 'network-first',
    NetworkOnly = 'network-only',
}

// TODO: UPDATE ME
//  Add cacheKey fn support - can be static string as well
export interface ReactResourceCachingOptions {
    cachingPolicy?: CachingPolicy;
}

export type ReactResourceQueryOptions<
    TKwargs extends Kwargs<TKwargs> = {}
> = Omit<FetchOptions<TKwargs>, 'method'>;

export type ReactResourcePostOptions<
    TKwargs extends Kwargs<TKwargs> = {},
    TData extends ObjectMap = any
> = Omit<PostOptions<TData, TKwargs>, 'method'> & {
    method?: ResourcePostMethods;
};

interface ReactResourceResult<
    TKwargs extends Kwargs<TKwargs> = {},
    TResult extends ObjectMap = any
> {
    isLoading: boolean;
    data?: TResult;
    error?: ResourceErrorInterface | Error;
}

export interface ReactResourceQueryResult<
    TKwargs extends Kwargs<TKwargs> = {},
    TResult extends ObjectMap = any
> extends ReactResourceResult<TKwargs, TResult> {
    reload: () => void;
    run: (opts: ReactResourceQueryOptions<TKwargs>) => void;
}

export type ReactResourceDeferredResult<
    TKwargs extends Kwargs<TKwargs> = {},
    TData extends ObjectMap = any,
    TResult extends ObjectMap = any
> = [
    (opts: ReactResourcePostOptions<TKwargs, TData>) => void,
    ReactResourceResult<TKwargs, TResult>
];

export interface RouterContextProvidedProps {
    cache: LRUCache<string, any>;
    router: Router;
    resolveResource: (routeName: string) => Resource;
}

export interface ReactResourceProviderProps<TRouter extends Router> {
    children: ReactNode;
    router: TRouter;
}
