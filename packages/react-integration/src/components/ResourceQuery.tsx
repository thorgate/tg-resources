import { RequestConfig } from '@tg-resources/core';
import { Kwargs, ObjectMap, Query } from '@tg-resources/types';
import { ReactElement } from 'react';

import { useResourceQuery } from '../hooks/useResourceQuery';
import { ReactResourceQueryResult } from '../types';

export interface ResourceQueryProps<
    TKwargs extends Kwargs<TKwargs> = {},
    TResult extends ObjectMap = any
> {
    routeName: string;

    kwargs?: TKwargs;
    query?: Query;
    requestConfig?: RequestConfig;

    children: (
        props: ReactResourceQueryResult<TKwargs, TResult>
    ) => ReactElement | null;
}

export const ResourceQuery = <
    TKwargs extends Kwargs<TKwargs> = {},
    TResult extends ObjectMap = any
>({
    routeName,
    kwargs,
    query,
    requestConfig,
    children,
}: ResourceQueryProps<TKwargs, TResult>) => {
    const result = useResourceQuery(routeName, {
        kwargs,
        query,
        requestConfig,
    });
    return children(result);
};
