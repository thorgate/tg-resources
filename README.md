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
npm i -D tg-resources
```

## Basic Usage

```js
import Resource from "tg-resources"

const onLoad = result => console.log(result);
const onError = result => console.error(result);

// Do a get request to /path/to/api?foo=bar
new Resource('/path/to/api').fetch(null, {foo: 'bar'}).then(onLoad).catch(onError);

// Do a post request to /path/to/api?foo=bar with data: {'asd':'sdf'}
new Resource('/path/to/api').post(null, {asd: 'sdf'}, {foo: 'bar'}).then(onLoad).catch(onError);

// Do a patch request to /path/to/api?foo=bar with data: {'asd':'sdf'}
new Resource('/path/to/api').patch(null, {asd: 'sdf'}, {foo: 'bar'}).then(onLoad).catch(onError);

// Do a put request to /path/to/api?foo=bar with data: {'asd':'sdf'}
new Resource('/path/to/api').put(null, {asd: 'sdf'}, {foo: 'bar'}).then(onLoad).catch(onError);
```

## API

### ``new Resource(apiEndpoint, expectedStatus=[200, 201], mutateResponse)``

Construct a new resource for loading data from a single (or dynamic) endpoint

#### Arguments
1. `apiEndpoint` *(string)*: Api url used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
2. `[expectedStatus=[200, 201]]` *(Array)*: Valid response codes
3. `[mutateResponse=null]` *(Function)*: Optional function for mutating the response before it's sent back to the user. Signature: `response => response`

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
