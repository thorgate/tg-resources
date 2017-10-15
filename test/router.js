import { expect } from 'chai';

import Router, { Resource } from '../src';
import DEFAULTS from '../src/constants';


// Mocks
const mockMutateResponse = x => x;
const mockMutateError = x => x;

const mockPrepareError = (...x) => DEFAULTS.prepareError(...x);
const mockParseErrors = (...x) => DEFAULTS.parseErrors(...x);

const expectConfig = (instance, expectedConfig) => {
    const cfg = instance.config();

    const deepEqualKeys = [
        'statusValidationError',
        'statusSuccess',
        'cookies',
        'headers',

        'getCookies',
        'getHeaders',
    ];

    // sort used so errors are deterministic
    Object.keys(expectedConfig).sort().forEach((cfgKey) => {
        let value = cfg[cfgKey];
        const expected = expectedConfig[cfgKey];

        // load values from instance methods
        if (cfgKey === 'getCookies' || cfgKey === 'getHeaders') {
            value = instance[cfgKey]();
        }

        if (deepEqualKeys.indexOf(cfgKey) !== -1) {
            expect(value).to.deep.equal(expected,
                `Config key '${cfgKey}' does not deeply match expected value`);
        } else {
            expect(value).to.equal(expected,
                `Config key '${cfgKey}' does not match expected value (expected: '${expected}', is: '${value}')`);
        }
    });
};

export default {
    'routers work': {
        'routes are type-checked': () => {
            expect(() => {
                new Router({
                    top: null,
                });
            }).to.throw(Error, /All routes must be instances of Router or Resource/);

            expect(() => {
                new Router({
                    top() {},
                });
            }).to.throw(Error, /All routes must be instances of Router or Resource/);

            expect(() => {
                new Router({
                    top: () => {},
                });
            }).to.throw(Error, /All routes must be instances of Router or Resource/);
        },
        'rebind fails': () => {
            const res = new Resource('kek');

            new Router({
                top: res,
            });

            expect(() => {
                new Router({
                    top: res,
                });
            }).to.throw(Error, /Route 'top' is bound already/);
        },
        'isBound works': () => {
            const res = new Resource('kek');

            // should not be bound yet
            expect(res.isBound).to.equal(false);

            const api = new Router({
                top: res,
            });

            // should be same refrence (not a copy)
            expect(res).to.equal(api.top);

            // should bound now
            expect(res.isBound).to.equal(true);
            expect(api.top.isBound).to.equal(true);

            // parent for res should be api
            expect(res.parent).to.equal(api);
            expect(api.top.parent).to.equal(api);
        },
        'config flows down': () => {
            const api = new Router({
                aggressive: new Resource('rawr', {
                    cookies: {
                        from: 'resource',
                    },
                }),
                submissive: new Resource('meow'),
            }, {
                apiRoot: 'http://foo.localhost/baz/',
                cookies: {
                    from: 'router',
                    top: 'level',
                },
            });

            // router cfg flows to submissive
            expect(api.config().apiRoot).to.equal('http://foo.localhost/baz/');
            expect(api.submissive.config().apiRoot).to.equal('http://foo.localhost/baz/');
            expect(api.config().cookies).to.deep.equal({
                from: 'router',
                top: 'level',
            });
            expect(api.getCookies()).to.deep.equal({
                from: 'router',
                top: 'level',
            });
            expect(api.submissive.config().cookies).to.deep.equal({
                from: 'router',
                top: 'level',
            });
            // requestConfig overrides config
            expect(api.submissive.config({ cookies: { from: 'requestConfig' } }).cookies).to.deep.equal({
                from: 'requestConfig',
            });
            expect(api.submissive.getCookies()).to.deep.equal({
                from: 'router',
                top: 'level',
            });

            // aggressive merges w/ parent
            expect(api.aggressive.config().apiRoot).to.equal('http://foo.localhost/baz/');
            // .config.cookies is not merged
            expect(api.aggressive.config().cookies).to.deep.equal({
                from: 'resource',
            });
            // requestConfig overrides config
            expect(api.aggressive.config({ cookies: { from: 'requestConfig' } }).cookies).to.deep.equal({
                from: 'requestConfig',
            });
            // getCookies is merged w/ parent
            expect(api.aggressive.getCookies()).to.deep.equal({
                from: 'resource',
                top: 'level',
            });
        },
    },
    'router config merge -': {
        'simple config keys flow down': () => {
            const api = new Router({
                aggressive: new Resource('rawr', {
                    apiRoot: 'http://rawr.localhost/baz/',
                    mutateResponse: mockMutateResponse,
                    mutateError: mockMutateError,
                    prepareError: mockPrepareError,
                    parseErrors: mockParseErrors,
                    statusValidationError: [5678],
                    statusSuccess: [2337],
                    defaultAcceptHeader: 'text/html',
                }),
                submissive: new Resource('meow'),
            }, {
                apiRoot: 'http://foo.localhost/baz/',
                statusValidationError: [1234],
                statusSuccess: [1337],
            });

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
        },
        'simple config keys flow down [nested routers]': () => {
            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    apiRoot: 'http://rawr.localhost/baz/',
                    mutateResponse: mockMutateResponse,
                    mutateError: mockMutateError,
                    prepareError: mockPrepareError,
                    parseErrors: mockParseErrors,
                    statusValidationError: [5678],
                    statusSuccess: [2337],
                    defaultAcceptHeader: 'text/html',
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                apiRoot: 'http://foo.localhost/baz/',
                statusValidationError: [1234],
                statusSuccess: [1337],
            });

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
        },
        'cookies flow down': () => {
            const api = new Router({
                aggressive: new Resource('rawr', {
                    cookies: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Resource('meow'),
            }, {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'cookies flow down [nested routers]': () => {
            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    cookies: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'func cookies flow down': () => {
            const genericCookies = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });
            const aggressiveCookies = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Resource('rawr', {
                    cookies: aggressiveCookies,
                }),
                submissive: new Resource('meow'),
            }, {
                cookies: genericCookies,
            });

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
        },
        'func cookies flow down [nested routers]': () => {
            const genericCookies = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });
            const aggressiveCookies = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    cookies: aggressiveCookies,
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                cookies: genericCookies,
            });

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
        },
        'mixed (obj -> fn) cookies flow down': () => {
            const aggressiveCookies = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Resource('rawr', {
                    cookies: aggressiveCookies,
                }),
                submissive: new Resource('meow'),
            }, {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'mixed (obj -> fn) cookies flow down [nested routers]': () => {
            const aggressiveCookies = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    cookies: aggressiveCookies,
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                cookies: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'mixed (fn -> obj) cookies flow down': () => {
            const genericCookies = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });

            const api = new Router({
                aggressive: new Resource('rawr', {
                    cookies: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Resource('meow'),
            }, {
                cookies: genericCookies,
            });

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
        },
        'mixed (fn -> obj) cookies flow down [nested routers]': () => {
            const genericCookies = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });

            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    cookies: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                cookies: genericCookies,
            });

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
        },

        'headers flow down': () => {
            const api = new Router({
                aggressive: new Resource('rawr', {
                    headers: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Resource('meow'),
            }, {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'headers flow down [nested routers]': () => {
            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    headers: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'func headers flow down': () => {
            const genericHeaders = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });
            const aggressiveHeaders = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Resource('rawr', {
                    headers: aggressiveHeaders,
                }),
                submissive: new Resource('meow'),
            }, {
                headers: genericHeaders,
            });

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
        },
        'func headers flow down [nested routers]': () => {
            const genericHeaders = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });
            const aggressiveHeaders = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    headers: aggressiveHeaders,
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                headers: genericHeaders,
            });

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
        },
        'mixed (obj -> fn) headers flow down': () => {
            const aggressiveHeaders = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Resource('rawr', {
                    headers: aggressiveHeaders,
                }),
                submissive: new Resource('meow'),
            }, {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'mixed (obj -> fn) headers flow down [nested routers]': () => {
            const aggressiveHeaders = () => ({
                from: 'resource',
                will_be: null,
            });

            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    headers: aggressiveHeaders,
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                headers: {
                    from: 'router',
                    top: 'level',
                    will_be: 'deleted',
                },
            });

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
        },
        'mixed (fn -> obj) headers flow down': () => {
            const genericHeaders = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });

            const api = new Router({
                aggressive: new Resource('rawr', {
                    headers: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Resource('meow'),
            }, {
                headers: genericHeaders,
            });

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
        },
        'mixed (fn -> obj) headers flow down [nested routers]': () => {
            const genericHeaders = () => ({
                from: 'router',
                top: 'level',
                will_be: 'deleted',
            });

            const api = new Router({
                aggressive: new Router({
                    first: new Resource('rawr'),
                }, {
                    headers: {
                        from: 'resource',
                        will_be: null,
                    },
                }),
                submissive: new Router({
                    first: new Resource('meow'),
                }),
            }, {
                headers: genericHeaders,
            });

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
        },
    },
    'cant create router with route names which collide with router built-in methods': {
        'config overwrite throws': () => {
            expect(() => {
                new Router({
                    config: new Resource('kek'),
                });
            }).to.throw(Error, /config collides with Router built-in method names/);
        },
        'isBound overwrite throws': () => {
            expect(() => {
                new Router({
                    isBound: new Resource('kek'),
                });
            }).to.throw(Error, /isBound collides with Router built-in method names/);
        },
        'parent overwrite throws': () => {
            expect(() => {
                new Router({
                    parent: new Resource('kek'),
                });
            }).to.throw(Error, /parent collides with Router built-in method names/);
        },
        '_setParent overwrite throws': () => {
            expect(() => {
                new Router({
                    _setParent: new Resource('kek'),
                });
            }).to.throw(Error, /Route '_setParent' is invalid. Route names must not start with an underscore/);
        },
        'route names cant start with underscore': () => {
            expect(() => {
                new Router({
                    _randomRoute: new Resource('kek'),
                });
            }).to.throw(Error, /Route '_randomRoute' is invalid. Route names must not start with an underscore/);
        },
    },
    'defaults work': {
        'defaultRoutes works': () => {
            class SDK extends Router {
                static defaultRoutes = {
                    me: new Resource('user/me'),
                };
            }

            const sdk = new SDK();

            expect(sdk.me).to.be.an.instanceof(Resource);
            expect(sdk.me.apiEndpoint).to.be.equal('user/me');
        },
        'defaultConfig works': () => {
            class SDK extends Router {
                static defaultConfig = {
                    apiRoot: 'some/root',
                };
            }

            const sdk = new SDK();

            expect(sdk.config()).to.be.an('object');
            expect(sdk.config().apiRoot).to.be.equal('some/root');
        },
    },
};
