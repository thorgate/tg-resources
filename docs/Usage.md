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

