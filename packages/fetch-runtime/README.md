# TG-Resources Fetch runtime

This package contains polyfill's for `fetch`, `Response`, `Request` and `FormData` to be used with `tg-resources-fetch`.
Main idea behind this package is to provide `fetch` and friends to make them usable in environments where none exist.

> **Note:** You do not need to install this if you are targeting only modern browsers with native support for fetch
>  or when using node 18 and above.

## Installing

Using NPM

```sh
npm i @tg-resources/fetch-runtime
```

Or using Yarn

```sh
yarn add @tg-resources/fetch-runtime
```

## Usage

```js
// Import this at top of your application
import '@tg-resources/fetch-runtime';
```

## License

MIT © [Thorgate](http://github.com/thorgate)
