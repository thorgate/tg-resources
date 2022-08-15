import { isRouteTemplate, routeTemplate } from '../src';
import { cleanRoot, cleanRoute } from '../src/utils';

describe('cleanRoot', () => {
    test('cleanRoot works', () => {
        expect(cleanRoot('/')).toBe('');
        expect(cleanRoot('/test')).toBe('/test');
        expect(cleanRoot('/test/')).toBe('/test');
        expect(cleanRoot('/test/path')).toBe('/test/path');
        expect(cleanRoot('/test/path/')).toBe('/test/path');
    });
});

describe('cleanRoute', () => {
    test('cleanRoute works', () => {
        expect(cleanRoute('/')).toBe('');
        expect(cleanRoute('/test')).toBe('test');
        expect(cleanRoute('/test/')).toBe('test/');
        expect(cleanRoute('/test/path')).toBe('test/path');
        expect(cleanRoute('/test/path/')).toBe('test/path/');
    });
});

describe('isRouteTemplate', () => {
    test('happy path', () => {
        const method = routeTemplate('/test/path');

        expect(isRouteTemplate(method)).toBe(true);
    });

    test('not function', () => {
        const method = 'not a function';

        expect(isRouteTemplate(method)).toBe(false);
    });

    test('missing routePath', () => {
        const method = () => {};

        expect(isRouteTemplate(method)).toBe(false);
    });

    test('routepath is not a string', () => {
        const method = routeTemplate('/test/path');
        (method as any).routePath = 1;

        expect(isRouteTemplate(method)).toBe(false);
    });

    test('missing configure', () => {
        const method = routeTemplate('/test/path');
        delete (method as any).configure;

        expect(isRouteTemplate(method)).toBe(false);
    });
});
