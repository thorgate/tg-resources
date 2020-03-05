import { Optional } from '@tg-resources/types';

export abstract class ResponseInterface {
    // istanbul ignore next: Tested in package that implement Resource
    public constructor(
        response: Optional<any>,
        error: Optional<any> = null,
        request: Optional<any> = null
    ) {
        this._response = response;
        this._error = error;
        this._request = request;
    }

    public get response(): Optional<any> {
        // istanbul ignore next: Tested in package that implement Resource
        return this._response;
    }

    public get error(): Optional<any> {
        return this._error;
    }

    public get hasError() {
        return !!this.error;
    }

    public abstract get status(): Optional<number>;

    public get statusCode() {
        // istanbul ignore next: Tested in package that implement Resource
        return this.status;
    }

    public abstract get statusType(): Optional<number>;

    public abstract get text(): Optional<string>;

    public abstract get data(): Optional<any>;

    public abstract get headers(): Optional<any>;

    public abstract get contentType(): Optional<string>;

    public abstract get wasAborted(): boolean;

    protected readonly _response: Optional<any>;
    protected readonly _error: Optional<any>;
    protected readonly _request: Optional<any>;
}
