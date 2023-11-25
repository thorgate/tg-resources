import { expectError, expectType } from 'tsd';

import {
    routeTemplate,
    RouteTemplateWithKwargs,
    RouteTemplateWithoutKwargs,
} from '../src';

expectType<RouteTemplateWithoutKwargs>(routeTemplate('test/path'));

expectType<RouteTemplateWithKwargs<{ id: number }>>(
    routeTemplate('test/path', (kwargs: { id: number }) => kwargs)
);

expectType<RouteTemplateWithKwargs<{ id: number; } | undefined>>(routeTemplate('test/path', (kwargs?: { id: number }) => kwargs));

const renderPath1 = routeTemplate(
    'test/path',
    (kwargs: { id: number }) => kwargs
);

// $ExpectType string
expectType<string>(renderPath1({ id: 1 }));

// $ExpectError
expectError(renderPath1({ id: '1' }));

const renderPath2 = routeTemplate('test/path');

// $ExpectType string
expectType<string>(renderPath2());

// $ExpectError
expectError(renderPath2({ id: 1 }));
