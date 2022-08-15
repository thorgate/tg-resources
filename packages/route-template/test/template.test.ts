import { routeTemplate, withKwargs } from '../src';

describe('template format works :: auto slash', () => {
    const apiRoot = '/api';

    test.each([true, false])(`[lodash=%s] no-parameters`, (lodash: boolean) => {
        const render = routeTemplate('test/path');
        render.configure(apiRoot, lodash);

        expect(render()).toBe('/api/test/path');
    });

    test.each([true, false])(
        '[lodash=%s] with-parameters :: template',
        (lodash: boolean) => {
            const render = routeTemplate(
                'test/${id}',
                withKwargs<{ id: number }>()
            );
            render.configure(apiRoot, lodash);

            expect(render({ id: 1 })).toBe('/api/test/1');
        }
    );

    test.each([true, false])(
        '[lodash=%s] with-parameters :: mustache',
        (lodash: boolean) => {
            const render = routeTemplate(
                'test/{id}',
                (kwargs: { id: number }) => kwargs
            );
            render.configure(apiRoot, lodash);

            expect(render({ id: 1 })).toBe('/api/test/1');
        }
    );

    test.each([true, false])(
        '[lodash=%s] nested parameters :: template',
        (lodash: boolean) => {
            const render = routeTemplate(
                'test/${foo.bar.baz}',
                (kwargs: { foo: { bar: { baz: number } } }) => kwargs
            );
            render.configure(apiRoot, lodash);

            expect(render({ foo: { bar: { baz: 1 } } })).toBe('/api/test/1');
        }
    );

    test.each([true, false])(
        '[lodash=%s] nested parameters :: mustache',
        (lodash: boolean) => {
            const render = routeTemplate(
                'test/{foo.bar.baz}',
                (kwargs: { foo: { bar: { baz: number } } }) => kwargs
            );
            render.configure(apiRoot, lodash);

            expect(render({ foo: { bar: { baz: 1 } } })).toBe('/api/test/1');
        }
    );

    test.each([true, false])(
        '[lodash=%s] nested parameters :: missing values',
        (lodash: boolean) => {
            const render = routeTemplate(
                'test/${foo.bar.baz}/${foo.other}/asdasd',
                (kwargs: { foo: { bar: { baz: number } } }) => kwargs
            );
            render.configure(apiRoot, lodash);

            expect(render({ foo: { bar: { baz: 1 } } })).toBe(
                '/api/test/1//asdasd'
            );
        }
    );
});

describe('template format works :: fix slash', () => {
    const apiRoot = '/api/';

    test('no-parameters', () => {
        const render = routeTemplate('/test/path');
        render.configure(apiRoot);

        expect(render()).toBe('/api/test/path');
    });
});
