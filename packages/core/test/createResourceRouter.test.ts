import 'jest-extended';

import { createResourceRouter } from '../src';
import DEFAULTS from '../src/constants';
import { DummyResource } from '../src/DummyResource';

describe('createRouter :: invalid type used', () => {
    test('invalid type :: top level', () => {
        expect(() => {
            createResourceRouter({
                resource: DummyResource,
                config: null,
                routerBuilder: (builder) => ({
                    alsoTest: builder.resource(1 as any),
                }),
            });
        }).toThrow(/Invalid endpoint config/);
    });

    test('invalid type :: nested', () => {
        expect(() => {
            createResourceRouter({
                resource: DummyResource,
                config: null,
                routerBuilder: (builder) => ({
                    test: builder.router((testBuilder) => ({
                        alsoTest: testBuilder.resource(false as any),
                    })),
                }),
            });
        }).toThrow(/Invalid endpoint config/);
    });
});

describe('createRouter :: string map', () => {
    const api = createResourceRouter({
        resource: DummyResource,
        config: { root: true },
        routerBuilder: (builder) => ({
            test: builder.resource('/a/'),
            test2: builder.router((testBuilder) => ({
                test: testBuilder.resource('/a/b/'),
                test2: testBuilder.resource('/a/c/'),
            })),
        }),
    });

    test('nested route name works correctly', () => {
        expect(api.routeName).toEqual('');
        expect(api.test.routeName).toEqual('test');
        expect(api.test2.routeName).toEqual('test2');
        expect(api.test2.test.routeName).toEqual('test2.test');
        expect(api.test2.test2.routeName).toEqual('test2.test2');
    });

    test('config flows correctly', () => {
        expect(api.config()).toEqual({
            ...DEFAULTS,
            root: true,
        });
        expect(api.test.config()).toEqual({
            ...DEFAULTS,
            root: true,
        });
        expect(api.test2.config()).toEqual({
            ...DEFAULTS,
            root: true,
        });
        expect(api.test2.test.config()).toEqual({
            ...DEFAULTS,
            root: true,
        });
    });

    test('with Cookies', () => {
        expect(api.test.getHeaders({ cookies: { a: '2' } })).toEqual({
            Accept: 'application/json',
            Cookie: 'a=2',
        });
    });

    const defaultResponse: any = {
        attachments: null,
        data: null,
        headers: { Accept: 'application/json' },
        query: null,
        requestConfig: null,
    };

    test('get /a/ works', async () => {
        const res = await api.test.get();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'get',
            url: '/a/',
        });
    });

    test('fetch /a/ works', async () => {
        const res = await api.test.fetch();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'get',
            url: '/a/',
        });
    });

    test('post /a/ works', async () => {
        const res = await api.test.post();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'post',
            url: '/a/',
            data: {},
        });
    });

    test('patch /a/ works', async () => {
        const res = await api.test.patch();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'patch',
            url: '/a/',
            data: {},
        });
    });

    test('put /a/ works', async () => {
        const res = await api.test.put();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'put',
            url: '/a/',
            data: {},
        });
    });

    test('del /a/ works', async () => {
        const res = await api.test.del();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'delete',
            url: '/a/',
            data: {},
        });
    });

    test('nested fetch /a/b/ works', async () => {
        const res = await api.test2.test.fetch();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'get',
            url: '/a/b/',
        });
    });

    test('nested post /a/b/ works', async () => {
        const res = await api.test2.test.post();
        expect(res).toEqual({
            ...defaultResponse,
            method: 'post',
            url: '/a/b/',
            data: {},
        });
    });
});

describe('createRouter :: resource tuple', () => {
    const api = createResourceRouter({
        resource: DummyResource,
        config: null,
        routerBuilder: (builder) => ({
            test: builder.resource(['/a/', { tuple1: true }]),
            test2: builder.router((testBuilder) => ({
                test: testBuilder.resource(['/a/b/', { tuple2: true }]),
                test2: testBuilder.resource(['/a/b/', { tuple2: true }]),
            })),
        }),
    });

    test('nested route name works correctly', () => {
        expect(api.routeName).toEqual('');
        expect(api.test.routeName).toEqual('test');
        expect(api.test2.routeName).toEqual('test2');
        expect(api.test2.test.routeName).toEqual('test2.test');
        expect(api.test2.test2.routeName).toEqual('test2.test2');
    });

    test('config flows correctly', () => {
        expect(api.config()).toEqual({
            ...DEFAULTS,
        });
        expect(api.test.config()).toEqual({
            ...DEFAULTS,
            tuple1: true,
        });
        expect(api.test2.config()).toEqual({
            ...DEFAULTS,
        });
        expect(api.test2.test.config()).toEqual({
            ...DEFAULTS,
            tuple2: true,
        });
        expect(api.test2.test2.config()).toEqual({
            ...DEFAULTS,
            tuple2: true,
        });
    });
});

describe('createRouter :: resource constructor', () => {
    const api = createResourceRouter({
        resource: DummyResource,
        config: { level: 0 },
        routerBuilder: (builder) => ({
            test: builder.resource({ apiEndpoint: '/a/', level: 1 }),
            test2: builder.router((testBuilder) => ({
                test: testBuilder.resource({ apiEndpoint: '/a/b/', level: 2 }),
                test2: testBuilder.resource({ apiEndpoint: '/a/c/', level: 2 }),
            })),
        }),
    });

    test('nested route name works correctly', () => {
        expect(api.routeName).toEqual('');
        expect(api.test.routeName).toEqual('test');
        expect(api.test2.routeName).toEqual('test2');
        expect(api.test2.test.routeName).toEqual('test2.test');
        expect(api.test2.test2.routeName).toEqual('test2.test2');
    });

    test('config flows correctly', () => {
        expect(api.config()).toEqual({
            ...DEFAULTS,
            level: 0,
        });
        expect(api.test.config()).toEqual({
            ...DEFAULTS,
            level: 1,
        });
        expect(api.test2.config()).toEqual({
            ...DEFAULTS,
            level: 0,
        });
        expect(api.test2.test.config()).toEqual({
            ...DEFAULTS,
            level: 2,
        });
        expect(api.test2.test2.config()).toEqual({
            ...DEFAULTS,
            level: 2,
        });
    });
});

describe('createRouter :: mixed', () => {
    const api = createResourceRouter({
        resource: DummyResource,
        config: { level: 0, apiRoot: 'https://server1.example.com' },
        routerBuilder: (builder) => ({
            test: builder.resource({ apiEndpoint: '/a/', level: 1 }),
            test2: builder.router((testBuilder) => ({
                test: testBuilder.resource({ apiEndpoint: '/a/b/', level: 2 }),
                test2: testBuilder.resource({ apiEndpoint: '/a/c/', level: 2 }),
            })),
            alternative: builder.router(
                (altBuilder) => ({
                    test: altBuilder.resource({ apiEndpoint: '/a/', level: 1 }),
                    test2: altBuilder.router((testBuilder) => ({
                        test: testBuilder.resource({
                            apiEndpoint: '/a/b/',
                            level: 2,
                        }),
                        test2: testBuilder.resource({
                            apiEndpoint: '/a/c/',
                            level: 2,
                        }),
                    })),
                }),
                { level: 0, apiRoot: 'https://server2.example.com' }
            ),
        }),
    });

    test('nested route name works correctly', () => {
        expect(api.routeName).toEqual('');
        expect(api.test.routeName).toEqual('test');
        expect(api.test2.routeName).toEqual('test2');
        expect(api.test2.test.routeName).toEqual('test2.test');
        expect(api.test2.test2.routeName).toEqual('test2.test2');
        expect(api.alternative.routeName).toEqual('alternative');
        expect(api.alternative.test.routeName).toEqual('alternative.test');
        expect(api.alternative.test2.routeName).toEqual('alternative.test2');
        expect(api.alternative.test2.test.routeName).toEqual(
            'alternative.test2.test'
        );
        expect(api.alternative.test2.test2.routeName).toEqual(
            'alternative.test2.test2'
        );
    });

    test('config flows correctly', () => {
        expect(api.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server1.example.com',
            level: 0,
        });
        expect(api.test.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server1.example.com',
            level: 1,
        });
        expect(api.test2.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server1.example.com',
            level: 0,
        });
        expect(api.test2.test.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server1.example.com',
            level: 2,
        });
        expect(api.test2.test2.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server1.example.com',
            level: 2,
        });
    });

    test('config flows correctly :: alternative', () => {
        expect(api.alternative.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server2.example.com',
            level: 0,
        });
        expect(api.alternative.test.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server2.example.com',
            level: 1,
        });
        expect(api.alternative.test2.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server2.example.com',
            level: 0,
        });
        expect(api.alternative.test2.test.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server2.example.com',
            level: 2,
        });
        expect(api.alternative.test2.test2.config()).toEqual({
            ...DEFAULTS,
            apiRoot: 'https://server2.example.com',
            level: 2,
        });
    });
});
