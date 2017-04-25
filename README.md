# tg-resources

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Downloads][download-badge]][npm-url]

> Abstractions on-top of `superagent` (or other Ajax libaries) for communication with REST.
> Targeted mostly against `DRF` running on `Django` so some logic might not be applicable for
> other frameworks.

## Install

```sh
npm i tg-resources
```

### react-native

For react-native please use `tg-resources-react-native` which does not depend on babel-runtime.

#### Migrating to 1.0.0

see the [Changelog](CHANGELOG.md#migrating-to-100)

## Basic Usage

```js
import Router, { Resource } from "tg-resources"

const onLoad = result => console.log(result);
const onError = result => console.error(result);


const api = new Router({
    cats: new Resource('/cats'),
    cat: new Resource('/cats/${pk}')
}, {
    apiRoot: '/api/v1' // Set api root
});

// Do a get request to /api/v1/cats?gender=M
api.cats.fetch(null, {gender: 'M'}).then(onLoad, onError);

// Do a head request to /api/v1/cats?gender=M
api.cats.head(null, {gender: 'M'}).then(onLoad, onError);

// Do a post request to /api/v1/cats with data: {name: 'Twinky', gender: 'M'}
api.cats.post(null, {name: 'Twinky', gender: 'M'}).then(onLoad, onError);

// Do a patch request to /api/v1/cats/1 with data: {name: 'Tinkelberg'}
api.cat.patch({pk: 1}, {name: 'Tinkelberg'}).then(onLoad, onError);

// Do a put request to /api/v1/cats with data: {pk: 1, name: 'Twinky'}
api.cats.put(null, {pk: 1, name: 'Twinky', gender: 'M'}).then(onLoad, onError);

// Do a delete request to /api/v1/cats/1 with data: {'free':'yes'}
api.cat.del({pk: 1}, {free: 'yes'}).then(onLoad, onError);
```

Please note that the router is useful for providing default configuration and grouping
endpoints. It's still possible to use Resources without a router(see [Resource api](#resource-api))

## <a name="configuration"></a>Configuration

- ``apiRoot`` *(String)*: Base for all resource paths
- ``headers`` *(Object|Function: Object)*: Optional Function or Object which can be used to add any additional headers to requests.
- ``cookies`` *(Object|Function)*: Optional Function or Object which can be used to add any additional cookies to requests. Please note
                                   that in modern browsers this is disabled due to security concerns.
- ``mutateResponse`` *(Function)*: Optional function with signature `response => response` which can be used to mutate response before
                                   resolving it.
- ``statusSuccess`` *(Array[int])*: Array (or a single value) of status codes to treat as a success. Default: [200, 201, 204]
- ``statusValidationError`` *(Array[int])*: Array (or a single value) of status codes to treat as ValidationError. Default: [400]
- ``defaultHeaders`` *(Object)*: Object of headers which should be added to all requests: Default: `{ Accept: 'application/json' }`
- ``parseErrors`` *(int)*: Function used to parse response errors into a ValidationError object. The default handler is built for Django/DRF
                           errors.
- ``prepareError`` *(int)*: Function used to normalize a single error. The default handler is built for Django/DRF errors.

## Error handling

With tg-resources, all errors are Rejected. The logic is best described with an example:

```js
const resource = new Resource('user/login');

const payload = {
    user: 'foo',
    passwrod: 'bar'
};

resource.post(null, payload).then(user => {
    console.log({
        type: 'LOGGED_IN',
        data: {
            user: user
        }
    });
}, error => {
    // Network error occurred
    if (error.isNetworkError) {
        console.error({
            type: 'NETWORK_FAILED',
            data: {
                error: error
            }
        });
    } else {
        // Validation error occurred (e.g.: wrong credentials)
        if (error.isValidationError) {
            console.error({
                type: 'LOGIN_FAILED',
                data: {
                    message: error.firstError(true),
                    error: error
                }
            });

        } else {
            // As a last resort, also handle invalid response codes
            console.error({
                type: 'SERVER_ERROR',
                data: {
                    error: error
                }
            });
        }
    }
});
```

## API

### <a name="resource-api"></a>``Resource``

Construct a new resource for loading data from a single (or dynamic) endpoint

#### Arguments

1. `apiEndpoint` *(string)*: Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
2. `options` *(Object)*: Object containing options for this resource. see [Configuration](#configuration)

#### Tokenized endpoints

The Resource module also supports dynamic urls by supporting ES6 token syntax. Request methods
can then provide values as an object using the first argument `kwargs`.

So for example:

```js
new Resource('/foo/bar/${pk}').get({pk: 1}).then(x => x);
```

Would result in a GET request to `/foo/bar/1`

#### Returns

*(Resource)*:  Returns instance of `Resource`.

### ``Resource.fetch``

Do a get request to the resource endpoint with optional kwargs and query parameters.

#### Arguments

1. `kwargs={}` *(Object)*: Object containing the replacement values if the resource uses tokenized urls
2. `query={}` *(Object|string)*: Query parameters to use when doing the request.

#### Returns

*(Promise)*:  Returns a `Promise` that resolves to the remote result or throws if errors occur.

### ``Resource.post``

Do a `method` request to the resource endpoint with optional kwargs and query parameters.

#### Arguments

1. `kwargs={}` *(Object)*: Object containing the replacement values if the resource uses tokenized urls
2. `data={}` *(Object|string)*: Query parameters to use when doing the request.
3. `query={}` *(Object|string)*: Query parameters to use when doing the request.
4. `method='post'` *(string)*: Lowercase name of the HTTP method that will be used for this request.

#### Returns
*(Promise)*:  Returns a `Promise` that resolves to the remote result or throws if errors occur.

### ``Resource.patch``

Alias for `Resource.post(kwargs, data, query, 'patch')`

### ``Resource.put``

Alias for `Resource.post(kwargs, data, query, 'put')`

### ``Resource.del``

Alias for `Resource.post(kwargs, data, query, 'del')`

### ``BaseResourceError``

Generic base class for all errors that can happen during requests

#### Attributes

- ``isNetworkError`` *(bool)*: Always ``false``
- ``isInvalidResponseCode`` *(bool)*: Always ``false``
- ``isValidationError`` *(bool)*: Always ``false``

### ``NetworkError``

Error class used for all network related errors

#### Extends ``BaseResourceError`` and overwrites:

- ``isNetworkError`` *(bool)*: Always ``true``

#### Attributes

- ``error`` *(Error)*: Original Error object that occured during network transport

### ``InvalidResponseCode``

Error class used when unexpected response code occurs

#### Extends ``BaseResourceError`` and overwrites:

- ``isInvalidResponseCode`` *(bool)*: Always ``true``

#### Attributes

- ``statusCode`` *(string)*: Response status code
- ``responseText`` *(int)*: Response body text

### ``ValidationError``

Error class used when backend response code is in ``options.statusValidationError``.

#### Extends ``InvalidResponseCode`` and overwrites:

- ``isInvalidResponseCode`` *(bool)*: Always ``false``
- ``isValidationError`` *(bool)*: Always ``true``

#### Methods

##### ``getError``

Get field specific error

###### Arguments

1. ``fieldName`` *(string)*: Field name
2. ``[allowNonField=false]`` *(bool)*: If true, also check for nonFieldErrors if the specified field does not have an error

###### Returns

*(any)*:  Returns a normalized error for ``fieldName`` or ``null``

##### ``getFieldError``

**Deprecated** alias of ``getError``

##### ``firstError``

Get first error normalized to a string for this ValidationError

###### Arguments

1. ``[allowNonField=false]`` *(bool)*: If true, also check for nonFieldErrors

###### Returns

*(any)*:  First error as a ``string`` or ``null``

## License

MIT © [Thorgate](http://github.com/thorgate)

[npm-url]: https://npmjs.org/package/tg-resources
[npm-image]: https://img.shields.io/npm/v/tg-resources.svg?style=flat-square

[travis-url]: https://travis-ci.org/thorgate/tg-resources
[travis-image]: https://img.shields.io/travis/thorgate/tg-resources.svg?style=flat-square

[depstat-url]: https://david-dm.org/thorgate/tg-resources
[depstat-image]: https://david-dm.org/thorgate/tg-resources.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/thorgate/tg-resources?branch=master
[coveralls-image]: https://coveralls.io/repos/github/thorgate/tg-resources/badge.svg?branch=master

[download-badge]: http://img.shields.io/npm/dm/tg-resources.svg?style=flat-square
