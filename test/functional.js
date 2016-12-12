import { assert, expect } from 'chai';

import listen from '../test-server';

import { Resource } from '../index';
import { isSubClass } from '../src/typeChecks';


const expectResponse = (prom, expectedData, done) => {
    prom.then((data) => {
        expect(data).to.deep.equal(expectedData);

        if (done) {
            done();
        }
    }, err => done(new Error(`Request failed: ${err.toString()}`)));
};

const expectError = (prom, { errorCls, statusCode, responseText }, done) => {
    prom.then(() => {
        done(new Error(`Expected request to fail with ${{ errorCls, statusCode, responseText }}`));
    }, (err) => {
        if (errorCls) {
            assert(isSubClass(err, errorCls), `${err} is not a subclass of ${errorCls}`);
        }

        if (statusCode) {
            expect(err.statusCode).to.equal(statusCode);
        }

        if (responseText) {
            expect(err.responseText).to.equal(responseText);
        }

        if (done) {
            done();
        }
    });
};


let server;

export default {
    'Resource basic requests work': {
        beforeEach() {
            server = listen();
        },

        afterEach() {
            server.close();
        },

        'fetch `/` works': (done) => {
            const res = new Resource('/', {
                apiRoot: 'http://127.0.0.1:3000',
                defaultHeaders: null,
            });

            expectResponse(res.fetch(), 'home', done);
        },

        'mutateResponse works': (done) => {
            const res = new Resource('/hello', {
                apiRoot: 'http://127.0.0.1:3000',
                mutateResponse(data, raw) {
                    return {
                        data,
                        poweredBy: raw.headers['x-powered-by'],
                    };
                },
            });

            expectResponse(res.fetch(), {
                data: {
                    message: 'world',
                },
                poweredBy: 'Express',
            }, done);
        },

        'fetch `/hello` works': (done) => {
            const res = new Resource('/hello', {
                apiRoot: 'http://127.0.0.1:3000',
            });

            expectResponse(res.fetch(), {
                message: 'world',
            }, done);
        },

        'headers work as object': (done) => {
            const res = new Resource('/headers', {
                apiRoot: 'http://127.0.0.1:3000',
                headers: { auth: 'foo' },
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'headers work as function': (done) => {
            const res = new Resource('/headers', {
                apiRoot: 'http://127.0.0.1:3000',
                headers: () => ({ auth: 'foo' }),
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'cookies work as object': (done) => {
            const res = new Resource('/cookies', {
                apiRoot: 'http://127.0.0.1:3000',
                cookies: { sessionid: 'secret' },
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'cookies work as function': (done) => {
            const res = new Resource('/cookies', {
                apiRoot: 'http://127.0.0.1:3000',
                cookies: () => ({ sessionid: 'secret' }),
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'kwargs work': (done) => {
            const res = new Resource('/dogs/${pk}', {
                apiRoot: 'http://127.0.0.1:3000',
            });

            expectResponse(res.fetch({ pk: '26fe9717-e494-43eb-b6d0-0c77422948a2' }), {
                pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
                name: 'Lassie',
            }, () => {
                expectResponse(res.fetch({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }), {
                    pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815',
                    name: 'Cody',
                }, done);
            });
        },

        'head request works': (done) => {
            const res = new Resource('/hello', {
                apiRoot: 'http://127.0.0.1:3000',
            });

            expectResponse(res.head(), {}, done);
        },

        'del request works': (done) => {
            const res = new Resource('/dogs/${pk}', {
                apiRoot: 'http://127.0.0.1:3000',
            });

            expectResponse(res.del({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }), { deleted: true }, () => {
                expectError(res.fetch({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }), {
                    statusCode: 404,
                }, done);
            });
        },

        'put request works': (done) => {
            const listRes = new Resource('/dogs/', {
                apiRoot: 'http://127.0.0.1:3000',
            });
            const detailRes = new Resource('/dogs/${pk}', {
                apiRoot: 'http://127.0.0.1:3000',
            });

            listRes.put(null, { name: 'Rex' }).then((data) => {
                expect(data).to.include.keys('pk');

                expectResponse(detailRes.fetch({ pk: data.pk }), {
                    pk: data.pk,
                    name: 'Rex',
                }, done);
            }, err => done(new Error(`Request failed: ${err.toString()}`)));
        },

        'patch request works': (done) => {
            const res = new Resource('/dogs/${pk}', {
                apiRoot: 'http://127.0.0.1:3000',
            });

            const params = { pk: '26fe9717-e494-43eb-b6d0-0c77422948a2' };

            expectResponse(res.patch(params, { name: 'Johnty' }), params, () => {
                expectResponse(res.fetch(params), {
                    pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
                    name: 'Johnty',
                }, done);
            });
        },
    },
};
