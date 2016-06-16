# tg-resources

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
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

see the [Changelog](CHANGELOG.md#migratingto100)

## Basic Usage

```js
import Resource from "tg-resources"

const onLoad = result => console.log(result);
const onError = result => console.error(result);

// Do a get request to /path/to/api?foo=bar
new Resource('/path/to/api').fetch(null, {foo: 'bar'}).then(onLoad, onError);

// Do a post request to /path/to/api?foo=bar with data: {'asd':'sdf'}
new Resource('/path/to/api').post(null, {asd: 'sdf'}, {foo: 'bar'}).then(onLoad, onError);

// Do a patch request to /path/to/api?foo=bar with data: {'asd':'sdf'}
new Resource('/path/to/api').patch(null, {asd: 'sdf'}, {foo: 'bar'}).then(onLoad, onError);

// Do a put request to /path/to/api?foo=bar with data: {'asd':'sdf'}
new Resource('/path/to/api').put(null, {asd: 'sdf'}, {foo: 'bar'}).then(onLoad, onError);

// Do a delete request to /path/to/api?foo=bar with data: {'asd':'sdf'}
new Resource('/path/to/api').del(null, {asd: 'sdf'}, {foo: 'bar'}).then(onLoad, onError);
```

## Configuration

TODO: Document different configuration keys...

## Error handling

With tg-resources, all errors are Rejected. The logic is best described with an example:

```
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
    // Network error occured
    if (error.isNetworkError()) {
        console.error({
            type: 'NETWORK_FAILED',
            data: {
                error: error
            }
        });
    } else {
        // Validation error occured (wrong credentials for example)
        if (error.isValidationError()) {
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

### ``new Resource(apiEndpoint, expectedStatus=[200, 201], mutateResponse=null, errorStatus=[400, ])``

Construct a new resource for loading data from a single (or dynamic) endpoint

#### Arguments

1. `apiEndpoint` *(string)*: Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
2. `[expectedStatus=[200, 201, 204]]` *(Array)*: Array (or a single value) of valid status codes. Default: [200, 201, 204]
3. `[mutateResponse=null]` *(Function)*: Function to mutate the response before resolving it. Signature: `response => response`
4. `[errorStatus=[400]]` *(Array)*: Array (or a single value) of status codes to treat as ValidationError. Default: [400]

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

### ``Resource.fetch(kwargs={}, query={})``

Do a get request to the resource endpoint with optional kwargs and query parameters.

#### Arguments

1. `kwargs={}` *(Object)*: Object containing the replacement values if the resource uses tokenized urls
2. `query={}` *(Object|string)*: Query parameters to use when doing the request.

#### Returns

*(Promise)*:  Returns a `Promise` that resolves to the remote result or throws if errors occur.

### ``Resource.post(kwargs={}, data={}, query={}, method='post')``

Do a `method` request to the resource endpoint with optional kwargs and query parameters.

#### Arguments

1. `kwargs={}` *(Object)*: Object containing the replacement values if the resource uses tokenized urls
2. `data={}` *(Object|string)*: Query parameters to use when doing the request.
3. `query={}` *(Object|string)*: Query parameters to use when doing the request.
4. `method='post'` *(string)*: Lowercase name of the HTTP method that will be used for this request.

#### Returns
*(Promise)*:  Returns a `Promise` that resolves to the remote result or throws if errors occur.

### ``Resource.patch(kwargs={}, data={}, query={})``

Alias for `Resource.post(kwargs, data, query, 'patch')`

### ``Resource.put(kwargs={}, data={}, query={})``

Alias for `Resource.post(kwargs, data, query, 'put')`

### ``Resource.del(kwargs={}, data={}, query={})``

Alias for `Resource.post(kwargs, data, query, 'del')`

### ``BaseResourceError(message)``

Generic base class for all errors that can happen during requests

#### Attributes

- ``isNetworkError`` *(bool)*: Always ``false``
- ``isInvalidResponseCode`` *(bool)*: Always ``false``
- ``isValidationError`` *(bool)*: Always ``false``

### ``NetworkError(error)``

Error class used for all network related errors

#### Extends ``BaseResourceError`` and overwrites:

- ``isNetworkError`` *(bool)*: Always ``true``

#### Attributes

- ``error`` *(Error)*: Original Error object that occured during network transport

### ``InvalidResponseCode(statusCode, statusText, responseText, type='InvalidResponseCode')``

Error class used when unexpected response code occurs

#### Extends ``BaseResourceError`` and overwrites:

- ``isInvalidResponseCode`` *(bool)*: Always ``true``

#### Attributes

- ``statusCode`` *(string)*: Response status code
- ``statusText`` *(string)*: Response status message
- ``responseText`` *(int)*: Response body text

### ``ValidationError(statusCode, statusText, responseText, type='InvalidResponseCode')``

Error class used when backend respons with a ``errorStatus``. This object can also be extended via
``Config.ValidationErrorExtras``.

#### Extends ``InvalidResponseCode`` and overwrites:

- ``isInvalidResponseCode`` *(bool)*: Always ``false``
- ``isValidationError`` *(bool)*: Always ``true``

#### Methods

##### ``getError(fieldName, allowNonField=false)``

Get field specific error

###### Arguments

1. ``fieldName`` *(string)*: Field name
2. ``[allowNonField=false]`` *(bool)*: If true, also check for nonFieldErrors if the specified field does not have an error

###### Returns

*(any)*:  Returns a normalized error for ``fieldName`` or ``null``

##### ``getFieldError(fieldName, allowNonField=false)``

**Deprecated** alias of ``getError``

##### ``firstError(allowNonField=false)``

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

[coveralls-url]: https://coveralls.io/r/thorgate/tg-resources
[coveralls-image]: https://img.shields.io/coveralls/thorgate/tg-resources.svg?style=flat-square

[depstat-url]: https://david-dm.org/thorgate/tg-resources
[depstat-image]: https://david-dm.org/thorgate/tg-resources.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/tg-resources.svg?style=flat-square
