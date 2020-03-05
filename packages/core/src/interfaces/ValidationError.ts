export abstract class ValidationErrorInterface {
    public fieldName: string | number | undefined;

    protected constructor(errors: any) {
        // Store errors
        this._errors = errors;
    }

    // Losing type check but does not restrict types at first
    // Can be changed to be more restrictive
    protected readonly _errors: any;

    public get errors() {
        return this._errors;
    }

    // Support for .. of loops
    public [Symbol.iterator](): Iterator<any> {
        const instance = this;

        let curKey = 0;
        let done = false;

        return {
            next() {
                const nextVal = instance.errorByIndex(curKey);

                // Note: If a custom error handler does not coerce undefined to null,
                //  the iterator will stop too early
                //
                // Feel free to submit a PR if this annoys you!
                if (nextVal === undefined) {
                    done = true;
                } else {
                    curKey += 1;
                }

                return {
                    done,
                    value: nextVal,
                };
            },
        };
    }

    /**
     * Used by firstError and iteration protocol
     */
    public errorByIndex(index: number) {
        return this._errors[index];
    }

    /* istanbul ignore next: just an interface */
    public hasError() {
        return this._errors.length > 0;
    }

    public bindToField(fieldName: string | number) {
        // istanbul ignore next: Only happens w/ custom error handlers
        if (process.env.NODE_ENV !== 'production') {
            if (this.fieldName && this.fieldName !== fieldName) {
                console.error(
                    `ValidationErrorInterface: Unexpected rebind of ${this} as ${fieldName} (was ${this.fieldName})`
                );
            }
        }

        this.fieldName = fieldName;
    }

    public abstract asString(glue?: string): string;

    public toString() {
        return this.asString();
    }

    public map<U>(
        callbackfn: (value: any, index?: number, array?: any[]) => U,
        thisArg?: any
    ): U[] {
        return this._iter().map(callbackfn, thisArg);
    }

    public forEach(
        callbackfn: (value: any, index?: number, array?: any[]) => void,
        thisArg?: any
    ): void {
        this._iter().forEach(callbackfn, thisArg);
    }

    public filter(
        callbackfn: (value: any, index?: number, array?: any[]) => boolean,
        thisArg?: any
    ) {
        return this._iter().filter(callbackfn, thisArg);
    }

    /**
     * Iterator used for .forEach/.filter/.map
     */
    protected _iter() {
        return this._errors;
    }
}
