## Configuration

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

