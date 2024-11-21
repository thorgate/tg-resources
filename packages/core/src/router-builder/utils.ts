import { isArray, isObject } from '@tg-resources/is';

import { Resource } from '../resource';
import { ObjectMap, RouteConfig } from '../types';

import {
    CreateResourceFactory,
    ResourceClassConstructor,
    ResourceConstructorObject,
    ResourceTuple,
} from './types';

export const isResourceTuple = (value: any): value is ResourceTuple =>
    isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'string' &&
    isObject(value[1]);

export const isResourceConstructorObject = (
    value: any
): value is ResourceConstructorObject =>
    isObject(value) && 'apiEndpoint' in value;

export const createResource: CreateResourceFactory<
    Resource<any, any, any, any>
> = <Klass extends Resource<any, any, any, any>>(
    ResourceKlass: ResourceClassConstructor<Klass>,
    apiEndpoint: string,
    config?: RouteConfig,
    _0?: ObjectMap
): Klass => new ResourceKlass(apiEndpoint, config);
