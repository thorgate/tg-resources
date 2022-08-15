import lodashTemplate from 'lodash.template';
import compileURL from './builtin';

import { RouteTemplate, PrepareKwargs } from './types';
import { cleanRoot, cleanRoute } from './utils';

export function routeTemplate<TKwargs = void>(
    route: string
): RouteTemplate<TKwargs>;

export function routeTemplate<PK extends PrepareKwargs<any>>(
    route: string,
    prepareKwargs: PK
): RouteTemplate<ReturnType<PK>, PK>;

export function routeTemplate(
    routePath: string,
    prepareKwargs?: (params: any) => any
) {
    // Interpolate defaults to {value} or ${value}
    const interpolate = /\$?{([\s\S]+?)}/g;

    let replacer: (params: any) => string;

    let currentRoot = '';
    function configure(apiRoot: string, lodash = true) {
        currentRoot = cleanRoot(apiRoot);

        replacer = lodash
            ? lodashTemplate(routePath, { interpolate })
            : compileURL(routePath);
    }

    function renderTemplate(params?: Record<string, unknown>) {
        const kwargs = prepareKwargs ? prepareKwargs(params) : null;

        const renderedPath = replacer(kwargs);

        return `${currentRoot}/${cleanRoute(renderedPath)}`;
    }

    renderTemplate.configure = configure;
    renderTemplate.routePath = routePath;

    return renderTemplate;
}
