import { assert, expect } from 'chai';
import { spy } from 'sinon';

import listen, { expectedBuffer, hostUrl } from '../test-server';

import { Resource, Response, RequestValidationError } from '../src';
import { isSubClass } from '../src/typeChecks';


const expectResponse = (prom, expectedData, done) => {
    prom.then((data) => {
        expect(data).to.deep.equal(expectedData);

        if (done) {
            done();
        }
    }, (err) => {
        // fail w/ the error
        done(new Error(`Request failed: ${err.toString()}`));
    }).catch(done);
};

const expectError = (prom, { errorCls, statusCode, responseText, exactError }, done) => {
    prom.then(() => {
        done(new Error(`Expected request to fail with ${{ errorCls, statusCode, responseText }}`));
    }, (err) => {
        let doneCalled = false;

        try {
            if (exactError) {
                expect(err).to.deep.equal(exactError);
            }

            if (errorCls) {
                assert(isSubClass(err, errorCls), `${err} is not a subclass of ${errorCls}`);
            }

            if (statusCode) {
                expect(err.statusCode).to.equal(statusCode);
            }

            if (responseText) {
                expect(err.responseText).to.equal(responseText);
            }
        } catch (e) {
            done(e);
            doneCalled = true;
        }

        if (done && !doneCalled) {
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
                apiRoot: hostUrl,
                defaultAcceptHeader: 'text/html',
            });

            expectResponse(res.fetch(), 'home', done);
        },

        'fetch `/` works w/ manual Accept header': (done) => {
            const res = new Resource('/', {
                apiRoot: hostUrl,
                headers: {
                    Accept: 'text/html',
                },
            });

            expectResponse(res.fetch(), 'home', done);
        },

        'fetch `/` is HTML even if Accept header is not explicitly set': (done) => {
            const res = new Resource('/', {
                apiRoot: hostUrl,
            });

            expectResponse(res.fetch(), 'home', done);
        },

        'cfg.mutateResponse is called during fetch': (done) => {
            const spyFn = spy();

            const res = new Resource('/hello', {
                apiRoot: hostUrl,
                mutateResponse: spyFn,
            });

            res.fetch().then(() => {
                try {
                    expect(spyFn.called).to.be.equal(true);
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
        },

        'mutateResponse functionally works': (done) => {
            const res = new Resource('/hello', {
                apiRoot: hostUrl,
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

        'cfg.mutateError is called during fetch': (done) => {
            const spyFn = spy();

            const res = new Resource('/error500', {
                apiRoot: hostUrl,
                mutateError: spyFn,
            });

            res.fetch().then(() => {
                try {
                    expect(spyFn.called).to.be.equal(true);
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
        },

        'mutateError functionally works': (done) => {
            const res = new Resource('/error500', {
                apiRoot: hostUrl,
                mutateError(error, rawResponse, resource) {
                    return [
                        'the error', // put a string here so comparison is easy
                        error.isInvalidResponseCode,
                        rawResponse.statusCode + 1055,
                        rawResponse.status + 1055,
                        rawResponse.statusCode + 1055,
                        resource,
                        rawResponse.statusType,
                    ];
                },
            });

            expectError(res.fetch(), {
                exactError: [
                    'the error',
                    true,
                    1555,
                    1555,
                    1555,
                    res,
                    5, // statusCode / 100 | 100
                ],
            }, done);
        },

        'cfg.mutateRawResponse is called during fetch': (done) => {
            // Why would anyone do this... :(
            const spyFn = spy(() => new Response({
                body: {
                    im: 'fake',
                },
                text: JSON.stringify({
                    im: 'fake',
                }),
                status: 200,
                statusType: 'ok',
                type: 'application/json',
                headers: {
                    'Content-Type': 'application/json',
                },
            }));

            const res = new Resource('/hello', {
                apiRoot: hostUrl,
                mutateRawResponse: spyFn,
            });

            res.fetch().then((data) => {
                try {
                    expect(spyFn.called).to.be.equal(true);
                    expect(data).to.deep.equal({
                        im: 'fake',
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            }, done);
        },

        'fetch `/hello` works': (done) => {
            const res = new Resource('/hello', {
                apiRoot: hostUrl,
            });

            expectResponse(res.fetch(), {
                message: 'world',
            }, done);
        },

        'headers work as object': (done) => {
            const res = new Resource('/headers', {
                apiRoot: hostUrl,
                headers: { auth: 'foo' },
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'headers work as function': (done) => {
            const res = new Resource('/headers', {
                apiRoot: hostUrl,
                headers: () => ({ auth: 'foo' }),
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'cookies work as object': (done) => {
            const res = new Resource('/cookies', {
                apiRoot: hostUrl,
                cookies: { sessionid: 'secret' },
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'cookies work as function': (done) => {
            const res = new Resource('/cookies', {
                apiRoot: hostUrl,
                cookies: () => ({ sessionid: 'secret' }),
            });

            expectResponse(res.fetch(), {
                authenticated: true,
            }, done);
        },

        'kwargs work': (done) => {
            const res = new Resource('/dogs/${pk}', {
                apiRoot: hostUrl,
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
                apiRoot: hostUrl,
            });

            expectResponse(res.head(), {}, done);
        },

        'options request works': (done) => {
            const res = new Resource('/options', {
                apiRoot: hostUrl,
            });

            expectResponse(res.options(), {
                message: 'options',
            }, done);
        },

        'del request works': (done) => {
            const res = new Resource('/dogs/${pk}', {
                apiRoot: hostUrl,
            });

            expectResponse(res.del({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }), { deleted: true }, () => {
                expectError(res.fetch({ pk: 'f2d8f2a6-7b68-4f81-8e47-787e4260b815' }), {
                    statusCode: 404,
                }, done);
            });
        },

        'put request works': (done) => {
            const listRes = new Resource('/dogs/', {
                apiRoot: hostUrl,
            });
            const detailRes = new Resource('/dogs/${pk}', {
                apiRoot: hostUrl,
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
                apiRoot: hostUrl,
            });

            const params = { pk: '26fe9717-e494-43eb-b6d0-0c77422948a2' };

            expectResponse(res.patch(params, { name: 'Johnty' }), params, () => {
                expectResponse(res.fetch(params), {
                    pk: '26fe9717-e494-43eb-b6d0-0c77422948a2',
                    name: 'Johnty',
                }, done);
            });
        },

        'statusValidationError is handled properly': (done) => {
            const res = new Resource('/error413', {
                apiRoot: hostUrl,
            });

            res.post(null, { name: '' }, undefined, undefined, {
                statusValidationError: [400, 413],
            }).then(() => {
                done(new Error('Expected request to fail'));
            }, (err) => {
                // the error must RequestValidationError
                expect(err).to.be.an.instanceof(RequestValidationError);

                // statusCode must be correct
                expect(err.statusCode).to.equal(413);

                // hasError must be true
                expect(err.hasError()).to.be.equal(true);

                // errors should be correct
                expect(err.errors.toString()).to.equal('name: This field is required.');

                // all good
                done();
            }).catch(done);
        },

        'statusValidationError is handled properly - nonField only': (done) => {
            const res = new Resource('/error400_nonField', {
                apiRoot: hostUrl,
            });

            res.fetch(null).then(() => {
                done(new Error('Expected request to fail'));
            }, (err) => {
                // the error must RequestValidationError
                expect(err).to.be.an.instanceof(RequestValidationError);

                // statusCode must be correct
                expect(err.statusCode).to.equal(400);

                // hasError must be true
                expect(err.hasError()).to.be.equal(true);

                // errors should be correct
                expect(err.errors.toString()).to.equal('Sup dog');

                // all good
                done();
            }).catch(done);
        },

        'attachments work': (done) => {
            const res = new Resource('/attachments', {
                apiRoot: hostUrl,
            });

            const postData = {
                name: 'foo',
                ignored0: null,
                ignored1: undefined,
                bool0: false,
                bool1: true,
                array: [
                    'first!',
                    'first! E: missed it',
                ],
                object: {
                    foo: 1,
                    bar: 0,
                },
            };

            const attachments = [
                {
                    field: 'text',
                    file: expectedBuffer,
                    name: 'dummy.txt',
                },
            ];

            res.post(null, postData, null, attachments).then((response) => {
                expect(response).to.deep.equal({
                    name: 'foo',
                    text: {
                        name: 'dummy.txt',
                        size: expectedBuffer.length,
                    },
                    bool0: 'false',
                    bool1: 'true',
                    array: postData.array,
                    object: JSON.stringify(postData.object),
                });

                // all good
                done();
            }, done);
        },
    },
};
