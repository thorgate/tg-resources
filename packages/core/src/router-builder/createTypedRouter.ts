import { Resource } from '../resource';
import { Router } from '../router';
import { RouteMap, RouterInterface } from '../types';

import { RouterBuilder } from './builder';
import { CreateResourceRouterOptions } from './types';

export function createTypedRouter<
    Klass extends Resource<any, any, any, any>,
    Definitions extends RouteMap
>(
    options: CreateResourceRouterOptions<Klass, Definitions>
): RouterInterface & Definitions {
    const { config, resource, routerBuilder } = options;

    const builder = new RouterBuilder<Klass>(resource);

    return new Router(routerBuilder(builder), config) as Router & Definitions;
}
