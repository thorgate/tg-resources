import { Kwargs, ObjectMap, ResourcePostMethods } from '@tg-resources/types';
import { useCallback, useMemo } from 'react';
import { DeferFn, useAsync } from 'react-async';

import {
    ReactResourceDeferredResult,
    ReactResourcePostOptions,
} from '../types';
import { useResolveResource } from './useResolveResource';

/**
 * Fetch data from the API resources.
 */
export function useResourceDeferred<
    TKwargs extends Kwargs<TKwargs> = {},
    TData extends ObjectMap = any,
    TResult = any
>(
    routeName: string,
    method: ResourcePostMethods = 'post',
    {
        kwargs,
        query,
        data: inputData,
        attachments,
        requestConfig = {},
    }: ReactResourcePostOptions<TKwargs, TData> = {}
): ReactResourceDeferredResult<TKwargs, TResult> {
    const resource = useResolveResource(routeName);
    const deferFn = useCallback<DeferFn<TResult>>(
        async (args, _0, { signal }) => {
            const [override = {}] = args;

            const response = await resource[method](
                override.kwargs || kwargs,
                override.data || inputData,
                override.query || query,
                override.attachments || attachments,
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
        [method, kwargs, query, requestConfig]
    );
    const { data, error, isInitial, isPending, run } = useAsync({
        deferFn,
        // initialValue: resourceContext.cache.get(cacheKey),
    });

    return useMemo(
        () => [
            run,
            {
                data,
                error: error as any,
                isLoading: isInitial || isPending,
            },
        ],
        [data, error, isInitial, isPending, run]
    );
}
