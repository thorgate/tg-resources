import lodashTemplate from 'lodash.template';

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

    const compiled = lodashTemplate(routePath, { interpolate });

    let currentRoot = '';
    function configure(apiRoot: string) {
        currentRoot = cleanRoot(apiRoot);
    }

    function renderTemplate(params?: Record<string, unknown>) {
        const kwargs = prepareKwargs ? prepareKwargs(params) : null;

        const renderedPath = compiled(kwargs);

        return `${currentRoot}/${cleanRoute(renderedPath)}`;
    }

    renderTemplate.configure = configure;
    renderTemplate.routePath = routePath;

    return renderTemplate;
}
