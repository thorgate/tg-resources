import { isFunction } from '@tg-resources/is';

import DEFAULTS from './constants';
import { Resource } from './resource';
import {
    ConfigType,
    Optional,
    OptionalMap,
    RequestConfig,
    ResourceInterface,
    RouteAble,
    RouteMap,
    RouterInterface
} from './types';
import { mergeConfig } from './util';


export function bindResources(routes: RouteMap, $this: RouterInterface) {
    const res: RouteMap = {};

    Object.keys(routes).forEach((routeName) => {
        // tslint:disable-next-line no-use-before-declare
        if (!routes[routeName] || !(routes[routeName] instanceof Router || routes[routeName] instanceof Resource)) {
            throw new Error(`All routes must be instances of Router or Resource (see '${routeName}')`);
        }

        if (routeName[0] === '_') {
            throw new Error(`Route '${routeName}' is invalid. Route names must not start with an underscore`);
        }

        if (routeName === 'config') {
            throw new Error(`Route ${routeName} collides with Router built-in method names`);
        }

        if (routes[routeName].isBound) {
            throw new Error(`Route '${routeName}' is bound already`);
        }

        // add to res
        res[routeName] = routes[routeName];

        // link them up
        res[routeName].setParent($this);
    });

    const childKeys = $this._childKeys.concat(Object.keys(res));

    try {
        Object.assign($this, res, { _childKeys: childKeys });
    } catch (e) {
        if (e instanceof TypeError) {
            let fieldName: string | RegExpExecArray | null = /property ([^\s]+) of/gi.exec(`${e}`);
            if (fieldName) {
                fieldName = `Route ${fieldName[1]} collides`;
            } else {
                /* istanbul ignore next: only happens w/ weird JS implementation */
                fieldName = 'Some route collides';
            }

            throw new Error(`${fieldName} with Router built-in method names`);
        } else {
            /* istanbul ignore next: only happens Object.assign is not available */
            throw e;
        }
    }
}


export class Router implements RouterInterface {
    public static defaultRoutes: Optional<RouteMap> = null;
    public static defaultConfig: Optional<OptionalMap<ConfigType>> = null;
    public _childKeys: string[] = [];

    [key: string]: ResourceInterface | RouterInterface | any;

    public constructor(routes: Optional<RouteMap> = null, config?: RequestConfig) {
        // Set config
        this._customConfig = config || {};

        // set parent to null
        this._parent = null;
        this._config = null;

        const defaultRoutes = (this.constructor as typeof Router).defaultRoutes;

        this._childKeys = [];

        if (defaultRoutes) {
            bindResources(defaultRoutes, this);
        }

        // Set routes
        if (routes) {
            bindResources(routes, this);
        }
    }

    protected _customConfig: RequestConfig;
    protected _parent: RouterInterface | null = null;
    protected _config: RequestConfig = null;

    public get parent() {
        return this._parent;
    }

    /**
     * Internal API. Not for public usage.
     * @param parent
     * @private
     */
    public setParent(parent: RouterInterface) {
        if (!this.isBound) {
            this._parent = parent;
        }
    }

    public get isBound() {
        return !!this._parent || !!this._config;
    }

    /**
     * Internal API.
     * @private
     */
    public getConfig() {
        return this._config;
    }

    public getHeaders() {
        const config = this.config();

        return {
            ...(this.parent ? this.parent.getHeaders() : {}),
            ...((isFunction(config.headers) ? config.headers() : config.headers) || {}),
        };
    }

    public getCookies() {
        const config = this.config();

        return {
            ...(this.parent ? this.parent.getCookies() : {}),
            ...((isFunction(config.cookies) ? config.cookies() : config.cookies) || {}),
        };
    }

    public config() {
        if (!this._config) {
            this._config = mergeConfig(
                this._parent ? this._parent.config() : DEFAULTS,
                (this.constructor as typeof Router).defaultConfig || null,
                this._customConfig,
            );
        }

        return this._config as ConfigType;
    }

    public setConfig(config: RequestConfig) {
        // Update _customConfig
        this._customConfig = {
            ...this._customConfig,
            ...config || {},
        };

        // Reset _config so it is recreated in the next call to .config
        this.clearConfigCache();
    }

    public clearConfigCache() {
        this._config = null;

        this._childKeys.forEach((key) => {
            (this[key] as RouteAble).clearConfigCache();
        });
    }
}
