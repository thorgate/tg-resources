import { ObjectMap } from '@tg-resources/types';

import {
    RequestConfig,
    RouteConfig,
    RouteConfigType,
    RouteInterface,
    RouterInterface,
} from './types';

export abstract class Route implements RouteInterface {
    protected _customConfig: RouteConfig = null;
    protected _routeName = '';
    protected _parent: RouterInterface | null = null;
    protected _config: RequestConfig = null;

    protected constructor(config: RouteConfig = null) {
        this._customConfig = config;

        if (config && 'signal' in config) {
            throw new Error('AbortSignal is not supported at top-level.');
        }
    }

    public get parent() {
        return this._parent;
    }

    /**
     * Internal API. Not for public usage.
     * @param parent Parent Router instance
     * @param routeName Bound name
     * @private
     */
    public setParent(parent: RouterInterface, routeName: string) {
        if (!this.isBound) {
            this._parent = parent;
            this._routeName = routeName;
        }
    }

    /**
     * Returns true if this route bound to Router instance.
     */
    public get isBound() {
        return !!this._parent || !!this._config;
    }

    /**
     * Get current route name in format: `parent.routeName`.
     *  Default is empty string.
     */
    public get routeName() {
        if (!this.parent) {
            return this._routeName;
        }

        const parentName = this.parent.routeName;

        if (!parentName) {
            return this._routeName;
        }

        return `${this.parent.routeName}.${this._routeName}`;
    }

    /**
     * Internal API.
     * @private
     */
    public getConfig() {
        return this._config;
    }

    public abstract config(): RouteConfigType;

    public setConfig(config: RouteConfig) {
        // Update _customConfig
        this._customConfig = {
            ...this._customConfig,
            ...(config || {}),
        };

        // Reset _config so it is recreated in the next call to .config
        this.clearConfigCache();
    }

    public abstract clearConfigCache(): void;

    public abstract getHeaders(): ObjectMap<string | null>;
    public abstract getCookies(): ObjectMap<string | null>;
}
