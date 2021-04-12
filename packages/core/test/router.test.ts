/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import 'jest-extended';

import {
    ConfigType,
    OptionalMap,
    Resource,
    ResourceErrorInterface,
    Router,
} from '../src';
import DEFAULTS from '../src/constants';
import { DummyResource } from './DummyResource';

// Mocks
// TODO : Define multiple types for this via interface
const mockMutateResponse = <R>(responseData: R) => responseData;
const mockMutateError = (error: ResourceErrorInterface) => error;

const mockPrepareError = (error: any, config: ConfigType) =>
    DEFAULTS.prepareError(error, config);
const mockParseErrors = (errorText: any, config: ConfigType) =>
    DEFAULTS.parseErrors(errorText, config);

const expectConfig = (
    instance: Router | Resource,
    expectedConfig: OptionalMap<ConfigType>
) => {
    const cfg = instance.config();

    // sort used so errors are deterministic
    Object.keys(expectedConfig)
        .sort()
        .forEach((cfgKey) => {
            let value: any = cfg[cfgKey];
            const expected: any = expectedConfig[cfgKey];

            // load values from instance methods
            if (cfgKey === 'getCookies' || cfgKey === 'getHeaders') {
                value = instance[cfgKey]();
            }

            expect(value).toEqual(expected);
        });
};

describe('routers work', () => {
    test('routes are type-checked', () => {
        expect(() => {
            new Router({
                top: null,
            } as any);
        }).toThrow(/All routes must be instances of Router or Resource/);

        expect(() => {
            new Router({
                top() {},
            } as any);
        }).toThrow(/All routes must be instances of Router or Resource/);

        expect(() => {
            new Router({
                top: () => {},
            } as any);
        }).toThrow(/All routes must be instances of Router or Resource/);

        expect(() => {
            new Router(null, {
                signal: new Error('fake') as any,
            });
        }).toThrow(/AbortSignal is not supported at top-level/);
    });

    test('rebind fails', () => {
        const res = new DummyResource('kek');

        new Router({
            top: res,
        });

        expect(() => {
            new Router({
                top: res,
            });
        }).toThrow(/Route 'top' is bound already/);
    });

    test('isBound works', () => {
        const res = new DummyResource('kek');

        // should not be bound yet
        expect(res.isBound).toEqual(false);

        const api = new Router({
            top: res,
        });

        // should be same refrence (not a copy)
        expect(res).toEqual(api.top);

        // should bound now
        expect(res.isBound).toEqual(true);
        expect(api.top.isBound).toEqual(true);

        // parent for res should be api
        expect(res.parent).toEqual(api);
        expect(api.top.parent).toEqual(api);
    });

    test('config flows down', () => {
        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    cookies: {
                        from: 'resource',
                    },
                }),
                submissive: new DummyResource('meow'),
            },
            {
                apiRoot: 'http://foo.localhost/baz/',
                cookies: {
                    from: 'router',
                    top: 'level',
                },
            }
        );

        // router cfg flows to submissive
        expect(api.config().apiRoot).toEqual('http://foo.localhost/baz/');
        expect(api.submissive.config().apiRoot).toEqual(
            'http://foo.localhost/baz/'
        );
        expect(api.config().cookies).toEqual({
            from: 'router',
            top: 'level',
        });
        expect(api.getCookies()).toEqual({
            from: 'router',
            top: 'level',
        });
        expect(api.submissive.config().cookies).toEqual({
            from: 'router',
            top: 'level',
        });
        // requestConfig overrides config
        expect(
            api.submissive.config({ cookies: { from: 'requestConfig' } })
                .cookies
        ).toEqual({
            from: 'requestConfig',
        });
        expect(api.submissive.getCookies()).toEqual({
            from: 'router',
            top: 'level',
        });

        // aggressive merges w/ parent
        expect(api.aggressive.config().apiRoot).toEqual(
            'http://foo.localhost/baz/'
        );
        // .config.cookies is not merged
        expect(api.aggressive.config().cookies).toEqual({
            from: 'resource',
        });
        // requestConfig overrides config
        expect(
            api.aggressive.config({ cookies: { from: 'requestConfig' } })
                .cookies
        ).toEqual({
            from: 'requestConfig',
        });
        // getCookies is merged w/ parent
        expect(api.aggressive.getCookies()).toEqual({
            from: 'resource',
            top: 'level',
        });
    });
});

describe('router config merge -', () => {
    test('simple config keys flow down', () => {
        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    apiRoot: 'http://rawr.localhost/baz/',
                    mutateResponse: mockMutateResponse,
                    mutateError: mockMutateError,
                    prepareError: mockPrepareError,
                    parseErrors: mockParseErrors,
                    statusValidationError: [5678],
                    statusSuccess: [2337],
                    defaultAcceptHeader: 'text/html',
                }),
                submissive: new DummyResource('meow'),
            },
            {
                apiRoot: 'http://foo.localhost/baz/',
                statusValidationError: [1234],
                statusSuccess: [1337],
            }
        );

        const routerLevelConfig = {
            apiRoot: 'http://foo.localhost/baz/',
            mutateResponse: null,
            mutateError: null,
            headers: null,
            cookies: null,
            prepareError: DEFAULTS.prepareError,
            parseErrors: DEFAULTS.parseErrors,
            statusValidationError: [1234],
            statusSuccess: [1337],
            defaultAcceptHeader: DEFAULTS.defaultAcceptHeader,
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            ...routerLevelConfig,
            apiRoot: 'http://rawr.localhost/baz/',
            mutateResponse: mockMutateResponse,
            mutateError: mockMutateError,
            prepareError: mockPrepareError,
            parseErrors: mockParseErrors,
            statusValidationError: [5678],
            statusSuccess: [2337],
            defaultAcceptHeader: 'text/html',
        });
    });

    test('simple config keys flow down [nested routers]', () => {
        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        apiRoot: 'http://rawr.localhost/baz/',
                        mutateResponse: mockMutateResponse,
                        mutateError: mockMutateError,
                        prepareError: mockPrepareError,
                        parseErrors: mockParseErrors,
                        statusValidationError: [5678],
                        statusSuccess: [2337],
                        defaultAcceptHeader: 'text/html',
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                apiRoot: 'http://foo.localhost/baz/',
                statusValidationError: [1234],
                statusSuccess: [1337],
            }
        );

        const routerLevelConfig: OptionalMap<ConfigType> = {
            apiRoot: 'http://foo.localhost/baz/',
            mutateResponse: null,
            mutateError: null,
            headers: null,
            cookies: null,
            prepareError: DEFAULTS.prepareError,
            parseErrors: DEFAULTS.parseErrors,
            statusValidationError: [1234],
            statusSuccess: [1337],
            defaultAcceptHeader: DEFAULTS.defaultAcceptHeader,
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, routerLevelConfig);

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            ...routerLevelConfig,
            apiRoot: 'http://rawr.localhost/baz/',
            mutateResponse: mockMutateResponse,
            mutateError: mockMutateError,
            prepareError: mockPrepareError,
            parseErrors: mockParseErrors,
            statusValidationError: [5678],
            statusSuccess: [2337],
            defaultAcceptHeader: 'text/html',
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, aggressiveLevelConfig);
    });

    test('cookies flow down', () => {
        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    cookies: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new DummyResource('meow'),
            },
            {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            cookies: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            cookies: {
                from: 'resource',
                will_be: null,
            },
            getCookies: {
                from: 'resource',
                top: 'level',
                will_be: null,
            },
        });
    });

    test('cookies flow down [nested routers]', () => {
        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        cookies: {
                            from: 'resource',
                            will_be: null,
                        },
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            cookies: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
            getCookies: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, routerLevelConfig);

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            cookies: {
                from: 'resource',
                will_be: null,
            },
            getCookies: {
                from: 'resource',
                top: 'level',
                will_be: null,
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, aggressiveLevelConfig);
    });

    test('func cookies flow down', () => {
        const genericCookies = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });
        const aggressiveCookies = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    cookies: aggressiveCookies,
                }),
                submissive: new DummyResource('meow'),
            },
            {
                cookies: genericCookies,
            }
        );

        const routerLevelConfig = {
            cookies: genericCookies,
            getCookies: genericCookies(),
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            cookies: aggressiveCookies,
            getCookies: {
                ...genericCookies(),
                ...aggressiveCookies(),
            },
        });
    });

    test('func cookies flow down [nested routers]', () => {
        const genericCookies = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });
        const aggressiveCookies = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        cookies: aggressiveCookies,
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                cookies: genericCookies,
            }
        );

        const routerLevelConfig = {
            cookies: genericCookies,
            getCookies: genericCookies(),
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, routerLevelConfig);

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            cookies: aggressiveCookies,
            getCookies: {
                ...genericCookies(),
                ...aggressiveCookies(),
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, aggressiveLevelConfig);
    });

    test('mixed (obj -> fn) cookies flow down', () => {
        const aggressiveCookies = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    cookies: aggressiveCookies,
                }),
                submissive: new DummyResource('meow'),
            },
            {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            cookies: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
            getCookies: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            cookies: aggressiveCookies,
            getCookies: {
                ...routerLevelConfig.cookies,
                ...aggressiveCookies(),
            },
        });
    });

    test('mixed (obj -> fn) cookies flow down [nested routers]', () => {
        const aggressiveCookies = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        cookies: aggressiveCookies,
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            cookies: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
            getCookies: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, routerLevelConfig);

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            cookies: aggressiveCookies,
            getCookies: {
                ...routerLevelConfig.cookies,
                ...aggressiveCookies(),
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, aggressiveLevelConfig);
    });

    test('mixed (fn -> obj) cookies flow down', () => {
        const genericCookies = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });

        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    cookies: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new DummyResource('meow'),
            },
            {
                cookies: genericCookies,
            }
        );

        const routerLevelConfig = {
            cookies: genericCookies,
            getCookies: genericCookies(),
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            cookies: {
                from: 'resource',
                will_be: null,
            },
            getCookies: {
                ...genericCookies(),
                from: 'resource',
                will_be: null,
            },
        });
    });

    test('mixed (fn -> obj) cookies flow down [nested routers]', () => {
        const genericCookies = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });

        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        cookies: {
                            from: 'resource',
                            will_be: null,
                        },
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                cookies: genericCookies,
            }
        );

        const routerLevelConfig = {
            cookies: genericCookies,
            getCookies: genericCookies(),
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, routerLevelConfig);

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            cookies: {
                from: 'resource',
                will_be: null,
            },
            getCookies: {
                ...genericCookies(),
                from: 'resource',
                will_be: null,
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, aggressiveLevelConfig);
    });

    test('headers flow down', () => {
        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    headers: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new DummyResource('meow'),
            },
            {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            headers: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            headers: {
                from: 'resource',
                will_be: null,
            },
            getHeaders: {
                from: 'resource',
                top: 'level',
                will_be: null,
                Accept: 'application/json',
            },
        });
    });

    test('headers flow down [nested routers]', () => {
        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        headers: {
                            from: 'resource',
                            will_be: null,
                        },
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            headers: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
            getHeaders: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, {
            ...routerLevelConfig,
            getHeaders: {
                ...routerLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            headers: {
                from: 'resource',
                will_be: null,
            },
            getHeaders: {
                from: 'resource',
                top: 'level',
                will_be: null,
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, {
            ...aggressiveLevelConfig,
            getHeaders: {
                ...aggressiveLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });
    });

    test('func headers flow down', () => {
        const genericHeaders = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });
        const aggressiveHeaders = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    headers: aggressiveHeaders,
                }),
                submissive: new DummyResource('meow'),
            },
            {
                headers: genericHeaders,
            }
        );

        const routerLevelConfig = {
            headers: genericHeaders,
            getHeaders: genericHeaders(),
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, {
            ...routerLevelConfig,
            getHeaders: {
                ...routerLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            headers: aggressiveHeaders,
            getHeaders: {
                Accept: 'application/json',
                ...genericHeaders(),
                ...aggressiveHeaders(),
            },
        });
    });

    test('func headers flow down [nested routers]', () => {
        const genericHeaders = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });
        const aggressiveHeaders = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        headers: aggressiveHeaders,
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                headers: genericHeaders,
            }
        );

        const routerLevelConfig = {
            headers: genericHeaders,
            getHeaders: {
                ...genericHeaders(),
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, {
            ...routerLevelConfig,
            getHeaders: {
                Accept: 'application/json',
                ...routerLevelConfig.getHeaders,
            },
        });

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            headers: aggressiveHeaders,
            getHeaders: {
                ...genericHeaders(),
                ...aggressiveHeaders(),
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, {
            ...aggressiveLevelConfig,
            getHeaders: {
                ...aggressiveLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });
    });

    test('mixed (obj -> fn) headers flow down', () => {
        const aggressiveHeaders = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    headers: aggressiveHeaders,
                }),
                submissive: new DummyResource('meow'),
            },
            {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            headers: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
            getHeaders: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, {
            ...routerLevelConfig,
            getHeaders: {
                ...routerLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            headers: aggressiveHeaders,
            getHeaders: {
                ...routerLevelConfig.headers,
                ...aggressiveHeaders(),
                Accept: 'application/json',
            },
        });
    });

    test('mixed (obj -> fn) headers flow down [nested routers]', () => {
        const aggressiveHeaders = () => ({
            from: 'resource',
            will_be: null,
        });

        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        headers: aggressiveHeaders,
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            }
        );

        const routerLevelConfig = {
            headers: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
            getHeaders: {
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, {
            ...routerLevelConfig,
            getHeaders: {
                ...routerLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            headers: aggressiveHeaders,
            getHeaders: {
                ...routerLevelConfig.headers,
                ...aggressiveHeaders(),
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, {
            ...aggressiveLevelConfig,
            getHeaders: {
                ...aggressiveLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });
    });

    test('mixed (fn -> obj) headers flow down', () => {
        const genericHeaders = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });

        const api = new Router(
            {
                aggressive: new DummyResource('rawr', {
                    headers: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new DummyResource('meow'),
            },
            {
                headers: genericHeaders,
            }
        );

        const routerLevelConfig = {
            headers: genericHeaders,
            getHeaders: {
                ...genericHeaders(),
            },
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, {
            ...routerLevelConfig,
            getHeaders: {
                ...routerLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });

        // aggressive overwrites stuff
        expectConfig(api.aggressive, {
            headers: {
                from: 'resource',
                will_be: null,
            },
            getHeaders: {
                ...genericHeaders(),
                from: 'resource',
                will_be: null,
                Accept: 'application/json',
            },
        });
    });

    test('mixed (fn -> obj) headers flow down [nested routers]', () => {
        const genericHeaders = () => ({
            from: 'router',
            top: 'level',
            will_be: 'deleted',
        });

        const api = new Router(
            {
                aggressive: new Router(
                    {
                        first: new DummyResource('rawr'),
                    },
                    {
                        headers: {
                            from: 'resource',
                            will_be: null,
                        },
                    }
                ),
                submissive: new Router({
                    first: new DummyResource('meow'),
                }),
            },
            {
                headers: genericHeaders,
            }
        );

        const routerLevelConfig = {
            headers: genericHeaders,
            getHeaders: genericHeaders(),
        };

        // correct on router level
        expectConfig(api, routerLevelConfig);

        // submissive uses router level stuff
        expectConfig(api.submissive, routerLevelConfig);
        expectConfig(api.submissive.first, {
            ...routerLevelConfig,
            getHeaders: {
                ...routerLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });

        // aggressive overwrites stuff
        const aggressiveLevelConfig = {
            headers: {
                from: 'resource',
                will_be: null,
            },
            getHeaders: {
                ...genericHeaders(),
                from: 'resource',
                will_be: null,
            },
        };
        expectConfig(api.aggressive, aggressiveLevelConfig);
        expectConfig(api.aggressive.first, {
            ...aggressiveLevelConfig,
            getHeaders: {
                ...aggressiveLevelConfig.getHeaders,
                Accept: 'application/json',
            },
        });
    });
});

describe('cant create router with route names which collide with router built-in methods', () => {
    test('config overwrite throws', () => {
        expect(() => {
            new Router({
                config: new DummyResource('kek'),
            });
        }).toThrow(/config collides with Router built-in method names/);
    });

    test('isBound overwrite throws', () => {
        expect(() => {
            new Router({
                isBound: new DummyResource('kek'),
            });
        }).toThrow(/isBound collides with Router built-in method names/);
    });

    test('parent overwrite throws', () => {
        expect(() => {
            new Router({
                parent: new DummyResource('kek'),
            });
        }).toThrow(/parent collides with Router built-in method names/);
    });

    test('_setParent overwrite throws', () => {
        expect(() => {
            new Router({
                _setParent: new DummyResource('kek'),
            });
        }).toThrow(
            /Route '_setParent' is invalid. Route names must not start with an underscore/
        );
    });

    test('route names cant start with underscore', () => {
        expect(() => {
            new Router({
                _randomRoute: new DummyResource('kek'),
            });
        }).toThrow(
            /Route '_randomRoute' is invalid. Route names must not start with an underscore/
        );
    });
});

describe('defaults work', () => {
    test('defaultRoutes works', () => {
        class SDK extends Router {
            static defaultRoutes = {
                me: new DummyResource('user/me'),
            };
        }

        const sdk = new SDK();

        expect(sdk.me).toBeInstanceOf(DummyResource);
        expect(sdk.me.apiEndpoint).toEqual('user/me');
    });

    test('defaultConfig works', () => {
        class SDK extends Router {
            static defaultConfig = {
                apiRoot: 'some/root',
            };
        }

        const sdk = new SDK();

        expect(sdk.config()).toBeObject();
        expect(sdk.config().apiRoot).toEqual('some/root');
    });

    test('setConfig works', () => {
        class SDK extends Router {
            static defaultConfig = {
                apiRoot: 'some/root',
                defaultAcceptHeader: 'fake/mime',
            };

            static defaultRoutes = {
                me: new DummyResource('user/me'),
            };
        }

        const sdk = new SDK(null, {
            headers: {
                from: 'resource',
            },
        });

        // Check config values
        expect(sdk.config()).toBeObject();
        expect(sdk.config().apiRoot).toEqual('some/root');
        expect(sdk.config().defaultAcceptHeader).toEqual('fake/mime');
        expect(sdk.config().headers).toEqual({
            from: 'resource',
        });
        expect(sdk.me.config()).toBeObject();
        expect(sdk.me.config().apiRoot).toEqual(sdk.config().apiRoot);
        expect(sdk.me.config().headers).toEqual(sdk.config().headers);
        expect(sdk.me.config().defaultAcceptHeader).toEqual(
            sdk.config().defaultAcceptHeader
        );

        // Update config via setConfig w/ no value
        sdk.setConfig(null);

        // _config should be nulled
        expect(sdk.getConfig()).toBeNull();

        // Check config values again
        expect(sdk.config()).toBeObject();
        expect(sdk.getConfig()).not.toBeNull();
        expect(sdk.config().apiRoot).toEqual('some/root');
        expect(sdk.config().defaultAcceptHeader).toEqual('fake/mime');
        expect(sdk.config().headers).toEqual({
            from: 'resource',
        });
        expect(sdk.me.config()).toBeObject();
        expect(sdk.me.config().apiRoot).toEqual(sdk.config().apiRoot);
        expect(sdk.me.config().headers).toEqual(sdk.config().headers);
        expect(sdk.me.config().defaultAcceptHeader).toEqual(
            sdk.config().defaultAcceptHeader
        );

        // Update config via setConfig
        sdk.setConfig({
            apiRoot: 'foo',
            headers: {
                via: 'setConfig',
            },
        });

        // _config should be nulled
        expect(sdk.getConfig()).toBeNull();

        // Check config values again
        expect(sdk.config()).toBeObject();
        expect(sdk.getConfig()).not.toBeNull();
        expect(sdk.config().apiRoot).toEqual('foo');
        expect(sdk.config().defaultAcceptHeader).toEqual('fake/mime');
        expect(sdk.config().headers).toEqual({
            via: 'setConfig',
        });
        expect(sdk.me.config()).toBeObject();
        expect(sdk.me.config().apiRoot).toEqual(sdk.config().apiRoot);
        expect(sdk.me.config().headers).toEqual(sdk.config().headers);
        expect(sdk.me.config().defaultAcceptHeader).toEqual(
            sdk.config().defaultAcceptHeader
        );

        // Call setConfig on the resource
        sdk.me.setConfig({
            headers: {
                via: 'route setConfig',
            },
        });

        // route level _config should be nulled
        expect(sdk.me.getConfig()).toBeNull();

        // but sdk level config should not
        expect(sdk.getConfig()).not.toBeNull();

        // Check config values again
        expect(sdk.me.config()).toBeObject();
        expect(sdk.me.config().headers).toEqual({
            via: 'route setConfig',
        });

        // sdk level config should not be affected
        expect(sdk.config()).toBeObject();
        expect(sdk.config().headers).toEqual({
            via: 'setConfig',
        });
    });
});
