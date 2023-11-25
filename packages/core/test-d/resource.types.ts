import { expectType } from 'tsd';

import { Attachments, Query, RequestConfig } from '../src';
import { DummyResource } from '../src/DummyResource';

// -------------------------------------------------------------------------------------

const resource = new DummyResource('/generic/route');

expectType<{ success: true }>(await resource.fetch<{ success: true }>());

expectType<{ success: true }>(await resource.post<{ success: true }>());

expectType<{ success: true }>(
    await resource.fetch<{ success: true }, { pk: number }>({ pk: 1 })
);

expectType<{ success: true }>(
    await resource.post<{ success: true }, { pk: number }>({ pk: 1 })
);

// -------------------------------------------------------------------------------------

type GetFn = <TResponse = { success: true }, TParams extends null = null>(
    kwargs?: TParams | null,
    query?: Query,
    requestConfig?: RequestConfig
) => Promise<TResponse>;

type PostFn = <
    TResponse = { success: true },
    TPayload extends null = null,
    TParams extends null = null
>(
    kwargs?: TParams | null,
    data?: string | TPayload | null,
    query?: Query,
    attachments?: Attachments,
    requestConfig?: RequestConfig
) => Promise<TResponse>;

const resource1 = new DummyResource<null, { success: true }, null>(
    '/generic/route'
);

expectType<GetFn>(resource1.fetch);
expectType<{ success: true }>(await resource1.fetch());

expectType<PostFn>(resource1.post);
expectType<{ success: true }>(await resource1.post());

// -------------------------------------------------------------------------------------

type GetFnWithArgs = <
    TResponse = { success: true },
    TParams extends { pk: number } = { pk: number }
>(
    kwargs?: TParams | null,
    query?: Query,
    requestConfig?: RequestConfig
) => Promise<TResponse>;

type PostFnWithArgs = <
    TResponse = { pk: number; name: string },
    TPayload extends { name: string } = { name: string },
    TParams extends { pk: number } = { pk: number }
>(
    kwargs?: TParams | null,
    data?: string | TPayload | null,
    query?: Query,
    attachments?: Attachments,
    requestConfig?: RequestConfig
) => Promise<TResponse>;

const resource2 = new DummyResource<
    { pk: number },
    { success: true },
    { name: string },
    { pk: number; name: string }
>('/generic/route/${pk}');

expectType<GetFnWithArgs>(resource2.fetch);
expectType<{ pk: 1; name: 'test' }>(await resource2.fetch());

expectType<PostFnWithArgs>(resource2.post);
expectType<{ pk: 1; name: 'test' }>(await resource2.post());
