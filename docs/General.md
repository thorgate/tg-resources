# tg-resources

[![NPM version][npm-image]][npm-url]
[![Documentation][docs-image]][docs-url]
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

With the version 4.0.0 hermes is fully supported as we have replaced `lodash.template` with our own url token replacement helper. :tada:

#### Using `signal` with react-native

Use [abortcontroller-polyfill](https://github.com/mo/abortcontroller-polyfill) until https://github.com/facebook/react-native/issues/18115 is resolved in react-native core. The polyfill does not actually close the connection, but instead ensures the fetch rejects the promise with `AbortError`. To use the polyfill add the following to the top of your app entrypoint:

```
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
```

## License <!-- {docsify-ignore} -->

MIT © [Thorgate](http://github.com/thorgate)

[npm-url]: https://npmjs.org/package/tg-resources
[npm-image]: https://img.shields.io/npm/v/tg-resources.svg?style=flat-square
[ci-url]: https://github.com/thorgate/tg-resources/actions/workflows/run-tests.yml
[ci-image]: https://github.com/thorgate/tg-resources/actions/workflows/run-tests.yml/badge.svg
[depstat-url]: https://libraries.io/npm/tg-resources/
[depstat-image]: https://img.shields.io/librariesio/github/thorgate/tg-resources
[coveralls-url]: https://coveralls.io/github/thorgate/tg-resources?branch=master
[coveralls-image]: https://coveralls.io/repos/github/thorgate/tg-resources/badge.svg?branch=master
[download-badge]: http://img.shields.io/npm/dm/tg-resources.svg?style=flat-square
[docs-image]: https://img.shields.io/badge/docs-latest-brightgreen.svg?style=flat-square
[docs-url]: https://thorgate.github.io/tg-resources/
