import Resource from './generic';

import {ValidationError} from './errors';


class Router {
    static DEFAULT_OPTIONS = {
        apiRoot: '',
        mutateResponse: null,
        headers: null,
        cookies: null,

        prepareError: ValidationError.defaultPrepareError,
        parseErrors: ValidationError.defaultParseErrors,

        statusSuccess: [200, 201, 204],
        statusValidationError: [400],

        defaultHeaders: {
            Accept: 'application/json'
        },

        onSourceError: typeof console !== 'undefined' ? err => console.error(err) : null,
    };

    constructor(routes, options) {
        // Set options
        this._customOptions = options;

        // set parent to null
        this._parent = null;

        // Set routes
        this.routes = Router.bindResources(routes, this);
    }

    setParent(parent) {
        this._parent = parent;
    }

    get isBound() {
        return !!this._parent || !!this._options;
    }

    get options() {
        if (!this._options) {
            return Router.mergeOptions(
                Router.DEFAULT_OPTIONS,
                this._parent ? this._parent.options : null,
                this._customOptions
            );
        }

        return this._options;
    }

    static bindResources(routes, parent) {
        const res = {};

        Object.keys(routes).forEach(routeName => {
            if (!(routes[routeName] || routes[routeName] instanceof Router || routes[routeName] instanceof Resource)) {
                throw new Error('all routes must be instancces of Router or Resource');
            }

            if (routes[routeName].isBound) {
                throw new Error(`${routes[routeName]} is bound already`);
            }

            // add to res
            res[routeName] = routes[routeName];

            // link them up
            res[routeName].setParent(parent);
        });

        return res;
    };

    static mergeOptions(...options) {
        const res = {};

        options.filter(x => !!x).forEach(opts => {
            Object.assign(res, opts);
        });

        return res;
    }
}


export default Router;
