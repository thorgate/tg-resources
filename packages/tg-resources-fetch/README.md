# tg-resources Fetch backend

[![NPM version][npm-image]][npm-url]

**Notice:** This package expects `fetch`, `Request`, `Response` and `FormData` to be available in global scope, e.g in `window` for Browser or in `global` for Node.js

## Installing

Using NPM

```sh
npm i tg-resources @tg-resources/fetch
```

Or using Yarn

```sh
yarn add tg-resources @tg-resources/fetch
```

### Does it work on react native?

**YES**

## Basic Usage

```js
import { Router } from 'tg-resources';
import { FetchResource } from '@tg-resources/fetch';

const onLoad = (result) => console.log(result);
const onError = (result) => console.error(result);

const api = new Router(
    {
        cats: new FetchResource('/cats'),
        cat: new FetchResource('/cats/${pk}'),
    },
    {
        apiRoot: '/api/v1', // Set api root
    }
);

// Do a get request to /api/v1/cats?gender=M
api.cats.fetch(null, { gender: 'M' }).then(onLoad, onError);

// Do a head request to /api/v1/cats?gender=M
api.cats.head(null, { gender: 'M' }).then(onLoad, onError);

// Do a post request to /api/v1/cats with data: {name: 'Twinky', gender: 'M'}
api.cats.post(null, { name: 'Twinky', gender: 'M' }).then(onLoad, onError);

// Do a patch request to /api/v1/cats/1 with data: {name: 'Tinkelberg'}
api.cat.patch({ pk: 1 }, { name: 'Tinkelberg' }).then(onLoad, onError);

// Do a put request to /api/v1/cats with data: {pk: 1, name: 'Twinky'}
api.cats
    .put(null, { pk: 1, name: 'Twinky', gender: 'M' })
    .then(onLoad, onError);

// Do a delete request to /api/v1/cats/1 with data: {'free':'yes'}
api.cat.del({ pk: 1 }, { free: 'yes' }).then(onLoad, onError);
```

## <a name="configuration"></a>Configuration

This package adds extra configuration methods for `Router` and `FetchResource`.

-   `querySerializeOptions` _(Object|undefined)_: **Advanced usage:** Options to configure query-string serialization. See [qs.stringify](https://github.com/ljharb/qs#stringifying).

This package is just Resource implementation using `fetch`.
For additional configuration, see [Configuration](https://github.com/thorgate/tg-resources/tree/master/README.md#configuration).

## License

MIT © [Thorgate](http://github.com/thorgate)

[npm-url]: https://npmjs.org/package/@tg-resources/fetch
[npm-image]: https://img.shields.io/npm/v/@tg-resources/fetch.svg?style=flat-square
