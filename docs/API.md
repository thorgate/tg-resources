## API

### `createRouter`

Creates type-safe `Router` instance.

#### Arguments

1. `routes` _(Object)_: Object matching pattern `{ [key]: string | { [key]: string } }`.
   String values are used as endpoints to create resource. For more info see [Resource API](#resource-api)
   This can be nested, meaning new router is created for object types found.
2. `config` _(Object)_: Object containing config for top level router. See [Configuration](#configuration)
3. `resourceKlass` _Resource_: Resource class that implements backend. This allows any of the backends to be used when creating `Router`.

### `Resource`

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

