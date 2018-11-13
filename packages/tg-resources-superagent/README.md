# tg-resources Superagent backend

[![NPM version][npm-image]][npm-url]


## Installing

Using NPM

```sh
npm i tg-resources @tg-resources/superagent
```

Or using Yarn

```sh
yarn add tg-resources @tg-resources/superagent
```


### Does it work on react native?

**YES**


## Basic Usage

```js
import { Router } from "tg-resources"
import { SuperagentResource } from "@tg-resources/superagent"

const onLoad = result => console.log(result);
const onError = result => console.error(result);


const api = new Router({
    cats: new SuperagentResource('/cats'),
    cat: new SuperagentResource('/cats/${pk}')
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

This package is just Resource implementation using `superagent`. 
For additional configuration, see [Configuration](https://github.com/thorgate/tg-resources/tree/master/README.md#configuration).


## License

MIT © [Thorgate](http://github.com/thorgate)


[npm-url]: https://npmjs.org/package/@tg-resources/superagent
[npm-image]: https://img.shields.io/npm/v/@tg-resources/superagent.svg?style=flat-square
