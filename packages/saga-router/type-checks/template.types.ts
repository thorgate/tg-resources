import { routeTemplate } from '../src';

// $ExpectType RouteTemplateWithoutKwargs
routeTemplate('test/path');

// $ExpectType RouteTemplateWithKwargs<{ id: number; }>
routeTemplate('test/path', (kwargs: { id: number}) => kwargs);

// $ExpectType RouteTemplateWithKwargs<{ id: number; } | undefined>
routeTemplate('test/path', (kwargs?: { id: number}) => kwargs);


const renderPath1 = routeTemplate('test/path', (kwargs: { id: number}) => kwargs);

// $ExpectType string
renderPath1({ id: 1 });

// $ExpectError
renderPath1({ id: '1' });

const renderPath2 = routeTemplate('test/path');

// $ExpectType string
renderPath2();

// $ExpectError
renderPath2({ id: 1 });
