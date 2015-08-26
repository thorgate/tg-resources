
export class ResponseWrapper {
    constructor(response) {
        this.response = response;
    }

    get status() {
        throw new Error('Not implemented');
    }

    get statusType() {
        throw new Error('Not implemented');
    }

    get text() {
        throw new Error('Not implemented');
    }

    get body() {
        throw new Error('Not implemented');
    }
}

export default ResponseWrapper;
