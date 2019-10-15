import 'jest-extended';

import { createRouter } from '../src';
import DEFAULTS from '../src/constants';
import { DummyResource } from './DummyResource';

describe('createRouter :: invalid type used', () => {
    test('invalid type :: top level', () => {
        expect(() => {
            createRouter(
                {
                    test: 1,
                },
                null,
                DummyResource
            );
        }).toThrow(/Unknown type used "test"/);
    });

    test('invalid type :: nested', () => {
        expect(() => {
            createRouter(
                {
                    test: {
                        alsoTest: false,
                    },
                },
                null,
                DummyResource
            );
        }).toThrow(/Unknown type used "alsoTest"/);
    });
});

describe('createRouter :: string map', () => {
    const api = createRouter(
        {
            test: '/a/',
            test2: {
                test: '/a/b/',
                test2: '/a/c/',
            },
        },
        { root: true },
        DummyResource
    );

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
            method: 'del',
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
    const api = createRouter(
        {
            test: ['/a/', { tuple1: true }],
            test2: {
                test: ['/a/b/', { tuple2: true }],
                test2: ['/a/c/', { tuple2: true }],
            },
        },
        null,
        DummyResource
    );

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
    const api = createRouter(
        {
            test: { apiEndpoint: '/a/', level: 1 },
            test2: {
                test: { apiEndpoint: '/a/b/', level: 2 },
                test2: { apiEndpoint: '/a/c/', level: 2 },
            },
        },
        { level: 0 },
        DummyResource
    );

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
    const api = createRouter(
        {
            test: { apiEndpoint: '/a/', level: 1 },
            test2: {
                test: { apiEndpoint: '/a/b/', level: 2 },
                test2: { apiEndpoint: '/a/c/', level: 2 },
            },
            alternative: createRouter(
                {
                    test: { apiEndpoint: '/a/', level: 1 },
                    test2: {
                        test: { apiEndpoint: '/a/b/', level: 2 },
                        test2: { apiEndpoint: '/a/c/', level: 2 },
                    },
                },
                { level: 0, apiRoot: 'https://server2.example.com' },
                DummyResource
            ),
        },
        { level: 0, apiRoot: 'https://server1.example.com' },
        DummyResource
    );

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
