import { Kwargs } from '@tg-resources/types';
import { useCallback, useMemo } from 'react';
import { DeferFn, PromiseFn, useAsync } from 'react-async';

import { ReactResourceQueryOptions, ReactResourceQueryResult } from '../types';
import { useResolveResource } from './useResolveResource';

/**
 * Fetch data from the API resources.
 */
export function useResourceQuery<
    TKwargs extends Kwargs<TKwargs> = {},
    TResult = any
>(
    routeName: string,
    options: ReactResourceQueryOptions<TKwargs> = {},
    autoFetch: boolean = true
): ReactResourceQueryResult<TKwargs, TResult> {
    const resource = useResolveResource(routeName);
    const deferFn = useCallback<DeferFn<TResult>>(
        async (args, { kwargs, query, requestConfig }, { signal }) => {
            const [override = {}] = args;

            const response = await resource.fetch(
                override.kwargs || kwargs,
                override.query || query,
                {
                    ...(override.requestConfig || requestConfig),

                    signal,
                }
            );

            // TODO: Response parsing & pagination support
            //  This will be done with extra config option to parse it correctly
            // resourceContext.cache.set(cacheKey, resource);

            return response;
        },
        []
    );

    const promiseFn = useCallback<PromiseFn<TResult>>(
        async (props, controller) => {
            return deferFn([], props, controller);
        },
        []
    );

    const { data, error, isInitial, isPending, reload, run } = useAsync({
        ...options,

        promiseFn,
        deferFn,
        watchFn: (props, prevProps) =>
            autoFetch &&
            props.kwargs !== prevProps.kwargs &&
            props.query !== prevProps.query &&
            props.requestConfig !== prevProps.requestConfig,
        // initialValue: resourceContext.cache.get(cacheKey),
    });

    return useMemo(
        () => ({
            data,
            error: error as any,
            isLoading: isInitial || isPending,
            reload,
            run,
        }),
        [data, error, isInitial, isPending, reload, run]
    );
}
