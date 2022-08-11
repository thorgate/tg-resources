# tg-resources

[![NPM version][npm-image]][npm-url]
[![Build Status][ci-image]][ci-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Downloads][download-badge]][npm-url]

> Abstractions on-top of `superagent` and `fetch` (or other Ajax libraries) for communication with REST.
> Targeted mostly against `Django Rest Framework (DRF)` running on `Django` so some logic might not be applicable for
> other frameworks.

## Installing

Using NPM

```sh
npm i tg-resources

# And add fetch backend
npm i @tg-resources/fetch

# Or use superagent backend
npm i @tg-resources/superagent
```

Or using Yarn

```sh
yarn add tg-resources

# And fetch backend
yarn add @tg-resources/fetch

# Or use superagent backend
yarn add @tg-resources/superagent
```

### Polyfills for fetch

When you are targeting browsers without native support for fetch or running this on node versions before 17 then you need
to provide polyfills for the fetch globals. The easiest way to do it is to add [@tg-resources/fetch-runtime](./packages/fetch-runtime#tg-resources-fetch-runtime).

Alternatively you can also just use your own polyfill if you want to. In that case the methods should be available in the
root scope (e.g. window/self for browsers or global for node).

### Does it work on react native?

**YES**

#### Using with hermes engine

Make sure to set `useLodashTemplate` config option to `false` to avoid running into this https://github.com/facebook/hermes/issues/222
hermes issue. See more details in #117.

We do plan to make the new url parameter renderer the default in the next major version but for we are introducing it
as opt-in to see how it behaves in the wild.

#### <a name="signal-rn"></a>Using `signal` with react-native

Use [abortcontroller-polyfill](https://github.com/mo/abortcontroller-polyfill) until https://github.com/facebook/react-native/issues/18115 is resolved in react-native core. The polyfill does not actually close the connection, but instead ensures the fetch rejects the promise with `AbortError`. To use the polyfill add the following to the top of your app entrypoint:

```
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
```

## Basic Usage

```js
import { Router } from "tg-resources"
import { FetchResource: Resource } from "@tg-resources/fetch"

const onLoad = result => console.log(result);
const onError = result => console.error(result);


const api = new Router({
    cats: new Resource('/cats'),
    cat: new Resource('/cats/${pk}')
}, {
    apiRoot: '/api/v1' // Set api root
});

const apiRouter = createRouter({
    cats: '/cats',
    cat: '/cats/${pk}',
}, {
    apiRoot: '/api/v1', // Set api root
}, Resource);

// Do a get request to /api/v1/cats?gender=M
api.cats.fetch(null, {gender: 'M'}).then(onLoad, onError);
apiRouter.cats.fetch(null, {gender: 'M'}).then(onLoad, onError);

// Do a head request to /api/v1/cats?gender=M
api.cats.head(null, {gender: 'M'}).then(onLoad, onError);
apiRouter.cats.head(null, {gender: 'M'}).then(onLoad, onError);

// Do a post request to /api/v1/cats with data: {name: 'Twinky', gender: 'M'}
api.cats.post(null, {name: 'Twinky', gender: 'M'}).then(onLoad, onError);
apiRouter.cats.post(null, {name: 'Twinky', gender: 'M'}).then(onLoad, onError);

// Do a patch request to /api/v1/cats/1 with data: {name: 'Tinkelberg'}
api.cat.patch({pk: 1}, {name: 'Tinkelberg'}).then(onLoad, onError);
apiRouter.cat.patch({pk: 1}, {name: 'Tinkelberg'}).then(onLoad, onError);

// Do a put request to /api/v1/cats with data: {pk: 1, name: 'Twinky'}
api.cats.put(null, {pk: 1, name: 'Twinky', gender: 'M'}).then(onLoad, onError);
apiRouter.cats.put(null, {pk: 1, name: 'Twinky', gender: 'M'}).then(onLoad, onError);

// Do a delete request to /api/v1/cats/1 with data: {'free':'yes'}
api.cat.del({pk: 1}, {free: 'yes'}).then(onLoad, onError);
apiRouter.cat.del({pk: 1}, {free: 'yes'}).then(onLoad, onError);
```

Please note that the router is useful for providing default configuration and grouping
endpoints. It's still possible to use Resources without a router(see [Resource api](#resource-api))

## <a name="configuration"></a>Configuration

-   `apiRoot` _(String)_: Base for all resource paths
-   `headers` _(Object|Function: Object)_: Optional Function or Object which can be used to add any additional headers to requests.
-   `cookies` _(Object|Function)_: Optional Function or Object which can be used to add any additional cookies to requests. Please note
    that in modern browsers this is disabled due to security concerns.
-   `mutateResponse` _(Function)_: Optional function with signature `(responseData, rawResponse: ResponseWrapper, resource: Resource, requestConfig: Object) => responseData`
    which can be used to mutate response data before resolving it. E.g. This can be used to provide access to raw
    response codes and headers to your success handler.
-   `mutateError` _(Function)_: Optional function with signature `(error: ResourceErrorInterface, rawResponse: ResponseWrapper, resource: Resource, requestConfig: Object) => error`
    which can be used to mutate errors before rejecting them. E.g. This can be used to provide access to raw response codes
    and headers to your error handler.
-   `statusSuccess` _(Array[int]|number)_: Array (or a single value) of status codes to treat as a success. Default: [200, 201, 204]
-   `statusValidationError` _(Array[int]|number)_: Array (or a single value) of status codes to treat as ValidationError. Default: [400]
-   `defaultAcceptHeader` _(String)_: Default accept header that is automatically added to requests (only if `headers.Accept=undefined`). Default:
    `'application/json'`
-   `parseErrors` _(Function)_: Function with signature `(errorText, parentConfig) => [nonFieldErrors, errors]` which is used to parse response
    errors into a ValidationError object. The default handler is built for Django/DRF errors.
-   `prepareError` _(Function)_: Function with signature `(err, parentConfig) => mixed` which is used to normalize a single error. The default
    handler is built for Django/DRF errors.
-   `mutateRawResponse` _(Function)_: **Advanced usage:** Optional function with signature `(rawResponse: ResponseWrapper, requestConfig: Object) => rawResponse` which can be
    used to mutate the response before it is resolved to `responseData` or a `ResourceErrorInterface` subclass. Use the
    source of `ResponseWrapper`, `SuperagentResponse` and `Resource::ensureStatusAndJson` for guidance.
-   `withCredentials` _(bool)_: Allow request backend to send cookies/authentication headers, useful when using same API for server-side rendering.
-   `allowAttachments` _(bool)_: Allow POST like methods to send attachments.
-   `signal`: _(AbortSignal)_: Pass in an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) object to abort the request when desired. **Only supported via request config.** Default: [null]. For react-native a [polyfill](#signal-rn) is needed.
-   `useLodashTemplate` _(bool)_: Set to false to use our own url parameter replacement logic instead of using `lodash.template` based one. Should be set to false when using react-native hermes engine to work around this [issue in hermes](https://github.com/facebook/hermes/issues/222). Default: `true`.

## Error handling

With tg-resources, all errors are Rejected. The logic is best described with an example:

```js
const resource = new Resource('user/login');

const errorHandler = (error) => {
    // Network error occurred
    if (error.isNetworkError) {
        console.error({
            type: 'NETWORK_FAILED',
            error,
        });
    } else if (error.isAbortError) {
        // Request was aborted
        console.error({
            type: 'ABORTED',
            error,
        });
    } else if (error.isValidationError) {
        // Validation error occurred (e.g.: wrong credentials)
        console.error({
            type: 'VALIDATION_ERROR',
            error,
        });
    } else {
        // As a last resort, also handle invalid response codes
        console.error({
            type: 'SERVER_ERROR',
            error,
        });
    }
};

const payload = {
    user: 'foo',
    passwrod: 'bar',
};

resource.post(null, payload).then(
    (user) =>
        console.log({
            type: 'LOGGED_IN',
            data: {
                user,
            },
        }),
    errorHandler
);
```

## API

### <a name="createrouter-api"></a>`createRouter`

Creates type-safe `Router` instance.

#### Arguments

1. `routes` _(Object)_: Object matching pattern `{ [key]: string | { [key]: string } }`.
   String values are used as endpoints to create resource. For more info see [Resource API](#resource-api)
   This can be nested, meaning new router is created for object types found.
2. `config` _(Object)_: Object containing config for top level router. See [Configuration](#configuration)
3. `resourceKlass` _Resource_: Resource class that implements backend. This allows any of the backends to be used when creating `Router`.

### <a name="resource-api"></a>`Resource`

Construct a new resource for loading data from a single (or dynamic) endpoint

#### Arguments

1. `apiEndpoint` _(string)_: Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
2. `config` _(Object)_: Object containing config for this resource. See [Configuration](#configuration)

#### Tokenized endpoints

The Resource module also supports dynamic urls by supporting ES6 token syntax. Request methods
can then provide values as an object using the first argument `kwargs`.

So for example:

```js
new Resource('/foo/bar/${pk}').get({ pk: 1 }).then((x) => x);
```

Would result in a GET request to `/foo/bar/1`

#### Returns

_(Resource)_: Returns instance of `Resource`.

### `Resource.fetch`

Do a get request to the resource endpoint with optional kwargs and query parameters.

#### Arguments

1. `kwargs=null` _(Object)_: Object containing the replacement values if the resource uses tokenized urls
2. `query=null` _(Object|string)_: Query parameters to use when doing the request.
3. `requestConfig=null` _(Object)_: Configuration overrides, useful when using same API for server-side rendering.

### `Resource.options`

Alias for `Resource.fetch(kwargs, query, requestConfig)` with `options` method.

### `Resource.head`

Alias for `Resource.fetch(kwargs, query, requestConfig)` with `head` method.

#### Returns

_(Promise)_: Returns a `Promise` that resolves to the remote result or throws if errors occur.

### `Resource.post`

Do a `method` request to the resource endpoint with optional kwargs and query parameters.

#### Arguments

1. `kwargs=null` _(Object)_: Object containing the replacement values if the resource uses tokenized urls
1. `data=null` _(Object|string)_: Query parameters to use when doing the request.
1. `query=null` _(Object|string)_: Query parameters to use when doing the request.
1. `attachments=null` _(Array)_: Attachments, creates multipart request
1. `requestConfig=null` _(Object)_: Configuration overrides, useful when using same API for server-side rendering.

#### Returns

_(Promise)_: Returns a `Promise` that resolves to the remote result or throws if errors occur.

### `Resource.patch`

Alias for `Resource.post(kwargs, data, query, attachments, requestConfig)` with `patch` method.

### `Resource.put`

Alias for `Resource.post(kwargs, data, query, attachments, requestConfig)` with `put` method.

### `Resource.del`

Alias for `Resource.post(kwargs, data, query, attachments, requestConfig)` with `del` method.

### `ResourceErrorInterface`

Generic base class for all errors that can happen during requests

#### Attributes

-   `isNetworkError` _(bool)_: Always `false`
-   `isInvalidResponseCode` _(bool)_: Always `false`
-   `isValidationError` _(bool)_: Always `false`

### `NetworkError`

Error class used for all network related errors

#### Extends `ResourceErrorInterface` and overwrites:

-   `isNetworkError` _(bool)_: Always `true`

#### Attributes

-   `error` _(Error)_: Original Error object that occured during network transport

### `AbortError`

Error class used when a request is aborted

#### Extends `ResourceErrorInterface` and overwrites:

-   `isAbortError` _(bool)_: Always `true`

#### Attributes

-   `error` _(Error)_: Original Error object that was raised by the request engine

### `InvalidResponseCode`

Error class used when unexpected response code occurs

#### Extends `ResourceErrorInterface` and overwrites:

-   `isInvalidResponseCode` _(bool)_: Always `true`

#### Attributes

-   `statusCode` _(string)_: Response status code
-   `responseText` _(int)_: Response body text

### `RequestValidationError`

Error class used when backend response code is in `config.statusValidationError`.

#### Extends `InvalidResponseCode` and overwrites:

-   `isInvalidResponseCode` _(bool)_: Always `false`
-   `isValidationError` _(bool)_: Always `true`

#### Attributes

-   `errors`: _(ValidationErrorInterface|any)_: The result from `requestConfig.parseError`

### `ValidationErrorInterface`

Error types returned by the default error parser.

Supports iteration (map/forEach/for .. of/etc)

#### Attributes

-   `errors`: _(any)_: Errors and error messages.

#### Types

Since DRF errors can be arbitrarily nested and one field can have multiple
errors, some specific types of interest:

-   `SingleValidationError`: Errors for a single field
    the `.errors` attribute is a list of strings.
-   `ValidationError`: Errors for an object, `.errors` is an object with field names as keys.
-   `ListValidationError`: Errors related to list of objects. `.errors` is a list of `ValidationErrorInterface`.

#### Methods

(\*) Not applicable to SingleValidationError

##### `hasError`

###### Returns

_(bool)_: True if there are any errors.

##### `getError`\*

Get field specific error

###### Arguments

1. `fieldName` _(Array<string>|string)_: Field name or path to child error, e.g `['parent', 'child']` or array indexes for `ListValidationError`
2. `[allowNonField=false]` _(bool)_: If true, also check for nonFieldErrors if the specified field does not have an error

###### Returns

_(any)_: Returns a normalized error for `fieldName` or `null`

##### `firstError`\*

Get first error normalized to a string for this ValidationError

###### Arguments

1. `[allowNonField=false]` _(bool)_: If true, also check for nonFieldErrors

###### Returns

_(any)_: First error as a `string` or `null`

## License

MIT © [Thorgate](http://github.com/thorgate)

[npm-url]: https://npmjs.org/package/tg-resources
[npm-image]: https://img.shields.io/npm/v/tg-resources.svg?style=flat-square
[ci-url]: https://github.com/thorgate/tg-resources/actions
[ci-image]: https://github.com/thorgate/tg-resources/workflows/.github/workflows/run-tests.yml/badge.svg?branch=master
[depstat-url]: https://david-dm.org/thorgate/tg-resources
[depstat-image]: https://david-dm.org/thorgate/tg-resources.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/thorgate/tg-resources?branch=master
[coveralls-image]: https://coveralls.io/repos/github/thorgate/tg-resources/badge.svg?branch=master
[download-badge]: http://img.shields.io/npm/dm/tg-resources.svg?style=flat-square
