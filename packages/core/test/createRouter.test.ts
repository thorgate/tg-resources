import 'jest-extended';

import { createRouter } from '../src';
import { DummyResource } from './DummyResource';


describe('createRouter returns strictly typed router', () => {
    const api = createRouter({
        test: '/a/',
        test2: {
            test: '/a/b/',
            test2: '/a/c/',
        }
    }, null, DummyResource);

    test('fetch /a/ works', () => {
        api.test.fetch().then((res: any) => {
            expect(res).toBeObject();
        });
    });

    test('post /a/ works', () => {
        api.test.post().then((res: any) => {
            expect(res).toBeObject();
        });
    });

    test('patch /a/ works', () => {
        api.test.patch().then((res: any) => {
            expect(res).toBeObject();
        });
    });

    test('put /a/ works', () => {
        api.test.put().then((res: any) => {
            expect(res).toBeObject();
        });
    });

    test('del /a/ works', () => {
        api.test.del().then((res: any) => {
            expect(res).toBeObject();
        });
    });

    test('nested fetch /a/b/ works', () => {
        api.test2.test.fetch().then((res: any) => {
            expect(res).toBeObject();
        });
    });

    test('nested fetch /a/b/ works', () => {
        api.test2.test.post().then((res: any) => {
            expect(res).toBeObject();
        });
    });
});
