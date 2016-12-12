import Resource from './generic';

import {ValidationError, ReservedRouteName} from './errors';
import {DEFAULT_OPTIONS} from './constants';

import {bindResources, mergeOptions} from './util';


class Router {
    constructor(routes, options) {
        // Set options
        this._customOptions = options;

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
        return !!this._parent || !!this._options;
    }

    get options() {
        if (!this._options) {
            this._options = mergeOptions(
                DEFAULT_OPTIONS,
                this._parent ? this._parent.options : null,
                this.defaultOptions || this.constructor.defaultOptions || null,
                this._customOptions
            );
        }

        return this._options;
    }
}


export default Router;
