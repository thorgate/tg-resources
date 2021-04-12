import { routeTemplate, withKwargs } from '../src';

describe('template format works :: auto slash', () => {
    const apiRoot = '/api';

    test('no-parameters', () => {
        const render = routeTemplate('test/path');
        render.configure(apiRoot);

        expect(render()).toBe('/api/test/path');
    });

    test('with-parameters :: template', () => {
        const render = routeTemplate(
            'test/${id}',
            withKwargs<{ id: number }>()
        );
        render.configure(apiRoot);

        expect(render({ id: 1 })).toBe('/api/test/1');
    });

    test('with-parameters :: mustache', () => {
        const render = routeTemplate(
            'test/{id}',
            (kwargs: { id: number }) => kwargs
        );
        render.configure(apiRoot);

        expect(render({ id: 1 })).toBe('/api/test/1');
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
