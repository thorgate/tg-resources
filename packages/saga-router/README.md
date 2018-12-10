# tg-resources Redux-Saga router

[![NPM version][npm-image]][npm-url]

> `tg-resources` [Redux-Saga](https://github.com/redux-saga/redux-saga) helper library.


## Installing

Using NPM

```sh
npm i tg-resources @tg-resources/redux-saga-router

# And resource backend
npm i @tg-resources/superagent

# Or
npm i @tg-resources/fetch
```

Or using Yarn

```sh
yarn add tg-resources @tg-resources/redux-saga-router

# And resource backend
yarn add @tg-resources/superagent

# Or
yarn add @tg-resources/fetch
```


### Does it work on react native?

**YES**


## Basic Usage

```js
import { createSagaRouter } from "@tg-resources/redux-saga-router"
import { SuperagentResource } from "@tg-resources/superagent"
import { call } from 'redux-saga/effects';

const onLoad = result => console.log(result);
const onError = result => console.error(result);


const api = createSagaRouter({
    cats: '/cats',
    cat: '/cats/${pk}',
}, {
    apiRoot: '/api/v1' // Set api root
}, SuperagentResource);

// Do a get request to /api/v1/cats?gender=M
function* fetchMaleCats() {
    try {
        const response = yield api.cats.fetch(null, {gender: 'M'});
        onLoad(response);
    } catch (err) {
        onError(err);
    }
}

// Or using sequence saga pattern
function* fetchMaleCatsSequence() {
    try {
        const response = yield api.cats.fetch(null, {gender: 'M'});
        onLoad(response);
    } catch (err) {
        onError(err);
    }
}

// Do a head request to /api/v1/cats?gender=F
function* fetchHeader() {
    try {
        const response = yield api.cats.head(null, {gender: 'F'});
        onLoad(response);
    } catch (err) {
        onError(err);
    }
}

// Do a post request to /api/v1/cats with data: {name: 'Twinky', gender: 'M'}
function* createTwinky() {
    try {
        const response = yield api.cats.post(null, {name: 'Twinky', gender: 'M'});
        onLoad(response);
    } catch (err) {
        onError(err);
    }
}

// Do a patch request to /api/v1/cats/1 with data: {name: 'Tinkelberg'}
function* updateTinkelberg() {
    try {
        const response = yield api.cat.patch({pk: 1}, {name: 'Tinkelberg'});
        onLoad(response);
    } catch (err) {
        onError(err);
    }
}

// Do a put request to /api/v1/cats with data: {pk: 1, name: 'Twinky'}
function* fetchFemaleCats() {
    try {
        const response = yield api.cats.put(null, {pk: 1, name: 'Twinky', gender: 'M'});
        onLoad(response);
    } catch (err) {
        onError(err);
    }
}

// Do a delete request to /api/v1/cats/1 with data: {'free':'yes'}
function* fetchFemaleCats() {
    try {
        const response = yield api.cat.del({pk: 1}, {free: 'yes'});
        onLoad(response);
    } catch (err) {
        onError(err);
    }
}
```


## `resourceEffectFactory` example


```
import { resourceEffectFactory } from '@tg-resources/redux-saga-router';


const resource = new SagaResource('/test', null, Resource);
const resourceWithParameter = new SagaResource('/test/${pk}', null, Resource);


function* someSaga() {
    // Use saga resource
    yield resourceEffectFactory(resource, 'fetch');
    
    // Use resource backend
    yield resourceEffectFactory(resource.resource, 'fetch');
    
    // Use saga resource with options
    yield resourceEffectFactory(resourceWithParameter, 'fetch', { kwargs: { pk: 1 } });
    
    // Use resource backend with options
    yield resourceEffectFactory(resourceWithParameter.resource, 'fetch', { kwargs: { pk: 1 } });
    
    // Use saga resource
    yield resourceEffectFactory(resource, 'fetch');
    
    // Use resource backend
    yield resourceEffectFactory(resource.resource, 'fetch');
    
    // Use saga resource with options
    yield resourceEffectFactory(resourceWithParameter, 'fetch', { kwargs: { pk: 1 } });
    
    // Use resource backend with options
    yield resourceEffectFactory(resourceWithParameter.resource, 'fetch', { kwargs: { pk: 1 } });
}
```


## <a name="configuration"></a>Configuration

This package adds extra configuration methods for `Router` and `Resource`.

- ``mutateRequestConfig`` *(Function)*: Optional function with signature `(config?: SagaRequestConfig, resource: Resource, options: ResourceSagaRunnerConfig) => SagaIterator | SagaRequestConfig | undefined` 
                                   which can be used to mutate request config before it is handed to resource backend.
                                   This is useful for setting authentication token to the api request. 
- ``onRequestError`` *(Function)*: Optional function with signature `(error: ErrorType, resource: Resource, options: ResourceSagaRunnerConfig) => void | SagaIterator`.
                                   This can be used to handle Sentry missing error handling.
- ``initializeSaga`` *(bool)*: **Advanced usage:** Initialize Saga iterator. This option disables usage of ``call`` effect.

For additional configuration, see [Configuration](https://github.com/thorgate/tg-resources/tree/master/README.md#configuration).


## API changes

### <a name="resource-api"></a>``Resource``

Construct a new resource for loading data from a single (or dynamic) endpoint

#### Arguments

1. `apiEndpoint` *(string)*: Endpoint used for this resource. Supports ES6 token syntax, e.g: "/foo/bar/${pk}"
2. `config` *(Object)*: Object containing config for this resource. see [Configuration](#configuration)
3. `resourceKlass` *(Object)*: Resource backend class used for providing [resource API](https://github.com/thorgate/tg-resources/tree/master/README.md#resource-api) for this endpoint.

All methods return `call` effect or `Iterator` (on `initializeSaga=true`) which yields api response or throw error if anything went wrong with api call.


For additional information, see [resource api](https://github.com/thorgate/tg-resources/tree/master/README.md#resource-api).


## License

MIT © [Thorgate](http://github.com/thorgate)


[npm-url]: https://npmjs.org/package/@tg-resources/redux-saga-router
[npm-image]: https://img.shields.io/npm/v/@tg-resources/redux-saga-router.svg?style=flat-square
