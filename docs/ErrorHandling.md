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

