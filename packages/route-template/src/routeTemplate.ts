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
    const replacer: (params: any) => string = compileURL(routePath);

    let currentRoot = '';
    function configure(apiRoot: string, _unused?: boolean) {
        currentRoot = cleanRoot(apiRoot);
    }

    function renderTemplate(params?: Record<string, unknown>) {
        const kwargs = prepareKwargs ? prepareKwargs(params) : params;

        const renderedPath = replacer(kwargs);

        return `${currentRoot}/${cleanRoute(renderedPath)}`;
    }

    renderTemplate.configure = configure;
    renderTemplate.routePath = routePath;

    return renderTemplate;
}
