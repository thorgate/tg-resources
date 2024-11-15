import { routeTemplate, withKwargs } from '../src';

describe('template format works :: auto slash', () => {
    const apiRoot = '/api';

    it(`[lodash=%s] no-parameters`, () => {
        const render = routeTemplate('test/path');
        render.configure(apiRoot);

        expect(render()).toBe('/api/test/path');
    });

    it('with-parameters :: template', () => {
        const render = routeTemplate(
            'test/${id}',
            withKwargs<{ id: number }>()
        );
        render.configure(apiRoot);

        expect(render({ id: 1 })).toBe('/api/test/1');
    });

    it('with-parameters :: mustache', () => {
        const render = routeTemplate(
            'test/{id}',
            (kwargs: { id: number }) => kwargs
        );
        render.configure(apiRoot);

        expect(render({ id: 1 })).toBe('/api/test/1');
    });

    it('nested parameters :: template', () => {
        const render = routeTemplate(
            'test/${foo.bar.baz}',
            (kwargs: { foo: { bar: { baz: number } } }) => kwargs
        );
        render.configure(apiRoot);

        expect(render({ foo: { bar: { baz: 1 } } })).toBe('/api/test/1');
    });

    it('nested parameters :: mustache', () => {
        const render = routeTemplate(
            'test/{foo.bar.baz}',
            (kwargs: { foo: { bar: { baz: number } } }) => kwargs
        );
        render.configure(apiRoot);

        expect(render({ foo: { bar: { baz: 1 } } })).toBe('/api/test/1');
    });

    it('nested parameters :: missing values', () => {
        const render = routeTemplate(
            'test/${foo.bar.baz}/${foo.other}/asdasd',
            (kwargs: { foo: { bar: { baz: number } } }) => kwargs
        );
        render.configure(apiRoot);

        expect(render({ foo: { bar: { baz: 1 } } })).toBe(
            '/api/test/1//asdasd'
        );
    });
});

describe('template format works :: fix slash', () => {
    const apiRoot = '/api/';

    test('no-parameters', () => {
        const render = routeTemplate('/test/path');
        render.configure(apiRoot);

        expect(render()).toBe('/api/test/path');
    });
});
