import { Resource } from '../resource';
import { Router } from '../router';
import { RouteMap, RouterInterface } from '../types';

import { RouterBuilder } from './builder';
import { CreateResourceRouterOptions } from './types';
import { createResource } from './utils';

export function createResourceRouter<
    Klass extends Resource<any, any, any, any>,
    Definitions extends RouteMap,
    InstanceKlass extends Resource<any, any, any, any> = Klass
>(
    options: CreateResourceRouterOptions<Klass, Definitions, InstanceKlass>
): RouterInterface & Definitions {
    const {
        resource,
        createResourceFactory = createResource as Exclude<
            typeof options['createResourceFactory'],
            undefined
        >,
        routerBuilder,
    } = options;

    const builder = new RouterBuilder<Klass, InstanceKlass>(
        resource,
        createResourceFactory
    );

    return new Router(routerBuilder(builder)) as Router & Definitions;
}
