import Router, { Resource } from '.';

import { isArray, isString, hasValue } from './typeChecks';


export function bindResources(routes, $this) {
    const res = {};

    Object.keys(routes).forEach(routeName => {
        if (!routes[routeName] || !(routes[routeName] instanceof Router || routes[routeName] instanceof Resource)) {
            throw new Error(`All routes must be instances of Router or Resource (see '${routeName}')`);
        }

        if (routeName[0] === '_') {
            throw new Error(`Route '${routeName}' is invalid. Route names must not start with an underscore`);
        }

        if (routes[routeName].isBound) {
            throw new Error(`Route '${routeName}' is bound already`);
        }

        // add to res
        res[routeName] = routes[routeName];

        // link them up
        res[routeName]._setParent($this);
    });

    try {
        Object.assign($this, res);
    } catch(e) {
        if (e instanceof TypeError) {
            let fieldName = /property ([^\s]+) of/gi.exec((e + ''));
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
};

export function mergeOptions(...options) {
    const res = {};

    options.filter(x => !!x).forEach(opts => {
        Object.assign(res, opts);
    });

    if (!isArray(res.statusSuccess) && hasValue(res.statusSuccess)) {
        res.statusSuccess = [res.statusSuccess, ];
    }

    if (!isArray(res.statusValidationError) && hasValue(res.statusValidationError)) {
        res.statusValidationError = [res.statusValidationError, ];
    }

    return res;
}

export function truncate(value, limit) {
    if (!value || value.length < limit) {
        return value;
    }

    if (!isString(value)) {
        value = `${value}`;
    }

    return `${value.substring(0, limit - 3)}...`;
}
