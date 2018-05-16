import DEFAULTS from './constants';
import { isFunction } from './typeChecks';
import { bindResources, mergeConfig } from './util';


class Router {
    constructor(routes, config) {
        // Set config
        this._customConfig = config;

        // set parent to null
        this._parent = null;

        const defaultRoutes = this.defaultRoutes || this.constructor.defaultRoutes;

        this._childKeys = [];

        if (defaultRoutes) {
            bindResources(defaultRoutes, this);
        }

        // Set routes
        if (routes) {
            bindResources(routes, this);
        }
    }

    getHeaders() {
        const headers = {
            ...(this.parent ? this.parent.getHeaders() : {}),
            ...((isFunction(this.config().headers) ? this.config().headers() : this.config().headers) || {}),
        };

        return headers;
    }

    getCookies() {
        return {
            ...(this.parent ? this.parent.getCookies() : {}),
            ...((isFunction(this.config().cookies) ? this.config().cookies() : this.config().cookies) || {}),
        };
    }

    get parent() {
        return this._parent;
    }

    _setParent(parent) {
        this._parent = parent;
    }

    get isBound() {
        return !!this._parent || !!this._config;
    }

    config() {
        if (!this._config) {
            this._config = mergeConfig(
                this._parent ? this._parent.config() : DEFAULTS,
                this.defaultConfig || this.constructor.defaultConfig || null,
                this._customConfig,
            );
        }

        return this._config;
    }

    setConfig(config) {
        // Update _customConfig
        this._customConfig = {
            ...this._customConfig,
            ...config || {},
        };

        // Reset _config so it is recreated in the next call to .config
        this.clearConfigCache();
    }

    clearConfigCache() {
        this._config = null;

        this._childKeys.forEach((key) => {
            this[key].clearConfigCache();
        });
    }
}


export default Router;
