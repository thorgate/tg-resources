import DEFAULTS from './constants';
import { bindResources, mergeConfig } from './util';


class Router {
    constructor(routes, config) {
        // Set config
        this._customConfig = config;

        // set parent to null
        this._parent = null;

        const defaultRoutes = this.defaultRoutes || this.constructor.defaultRoutes;

        if (defaultRoutes) {
            bindResources(defaultRoutes, this);
        }

        // Set routes
        if (routes) {
            bindResources(routes, this);
        }
    }

    getCookies() {
        return {
            ...(this._parent ? this._parent.getCookies() : {}),
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

    get config() {
        if (!this._config) {
            this._config = mergeConfig(
                DEFAULTS,
                this._parent ? this._parent.config : null,
                this.defaultConfig || this.constructor.defaultConfig || null,
                this._customConfig,
            );
        }

        return this._config;
    }
}


export default Router;
