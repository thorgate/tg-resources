import {isArray} from './typeChecks';


export function bindResources(routes, $this) {
    const res = {};

    Object.keys(routes).forEach(routeName => {
        if (!(routes[routeName] || routes[routeName] instanceof Router || routes[routeName] instanceof Resource)) {
            throw new Error('all routes must be instancces of Router or Resource');
        }

        if (routeName[0] === '_') {
            throw new Error(`Route '${routeName}' is invalid. Route names must not start with an underscore`);
        }

        if (routes[routeName].isBound) {
            throw new Error(`${routes[routeName]} is bound already`);
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
                fieldName = `${fieldName[1]} collides`;
            } else {
                fieldName = 'some route collides';
            }

            throw new Error(`${fieldName} with Router built-in method names`);
        } else {
            throw e;
        }
    }
};

export function mergeOptions(...options) {
    const res = {};

    options.filter(x => !!x).forEach(opts => {
        Object.assign(res, opts);
    });

    if (!isArray(res.statusSuccess)) {
        res.statusSuccess = [res.statusSuccess, ];
    }

    if (!isArray(res.statusValidationError)) {
        res.statusValidationError = [res.statusValidationError, ];
    }

    return res;
}
