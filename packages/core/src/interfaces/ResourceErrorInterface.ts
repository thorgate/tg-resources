export abstract class ResourceErrorInterface {
    protected readonly _message: string;

    protected constructor(message: string) {
        this._message = message;
    }

    public toString() {
        return this._message;
    }

    public get isNetworkError() {
        return false;
    }

    // istanbul ignore next: Tested in packages that implement Resource
    public get isInvalidResponseCode() {
        return false;
    }

    public get isValidationError() {
        return false;
    }

    public get isAbortError() {
        return false;
    }
}
