export type Optional<T> = T | null;

export type ObjectMap<T = any, K extends keyof any = any> = Record<K, T>;

export type ObjectMapFn<T = any> = () => ObjectMap<T>;

export type Kwargs<KW> = { [K in keyof KW]?: string | undefined };

export type Query = ObjectMap<string> | null;

export interface Attachment {
    field: string;
    name: string;
    file: Blob | Buffer;
}

export type Attachments = null | Attachment[];

export type ResourceFetchMethods = 'fetch' | 'head' | 'options';

export type ResourcePostMethods = 'post' | 'patch' | 'put' | 'del';

export type ResourceMethods = ResourceFetchMethods | ResourcePostMethods;

export type AllowedFetchMethods = 'get' | 'head' | 'options';

export type AllowedPostMethods = 'post' | 'patch' | 'put' | 'del';

export type AllowedMethods = AllowedFetchMethods | AllowedPostMethods;
