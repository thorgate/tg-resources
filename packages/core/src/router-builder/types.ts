import { Resource } from '../resource';
import {
    ConfigType,
    Kwargs,
    ObjectMap,
    OptionalMap,
    ResourceInterface,
    RouteConfig,
    RouteConfigType,
    RouteMap,
    RouterInterface,
} from '../types';

export type ResourceTuple<Config = OptionalMap<ConfigType>> = [string, Config];

export interface ResourceConstructorObject
    extends OptionalMap<RouteConfigType> {
    apiEndpoint: string;
}

export type ResourceClassConstructor<Klass> = new (
    apiEndpoint: string,
    config?: RouteConfig | null
) => Klass;

export type CreateResourceFactory<
    InstanceKlass extends Resource<any, any, any, any>
> = <BaseKlass extends Resource<any, any, any, any>>(
    resourceKlass: ResourceClassConstructor<BaseKlass>,
    apiEndpoint: string,
    config?: RouteConfig,
    options?: ObjectMap
) => InstanceKlass;

export interface RouterBuilderInterface {
    resource<
        Params extends Kwargs | null = Kwargs,
        TFetchResponse = any,
        TPostPayload extends ObjectMap | string | null = any,
        TPostResponse = TFetchResponse
    >(
        endpointConfig: ResourceTuple | ResourceConstructorObject | string
    ): ResourceInterface<Params, TFetchResponse, TPostPayload, TPostResponse>;

    router<TRouteMap extends RouteMap>(
        builder: (build: this) => TRouteMap
    ): RouterInterface & TRouteMap;
}

export interface CreateResourceRouterOptions<
    Klass extends Resource<any, any, any, any>,
    Definitions extends RouteMap,
    InstanceKlass extends Resource<any, any, any, any> = Klass
> {
    /**
     * The resource class to use when creating resources
     */
    resource: ResourceClassConstructor<Klass>;

    /**
     * Helper function used to create resource instances
     */
    createResourceFactory?: CreateResourceFactory<InstanceKlass>;

    /**
     * Router configuration
     */
    config: RouteConfig;

    /**
     * Build router definition
     * @param build
     */
    routerBuilder: (build: RouterBuilderInterface) => Definitions;
}
