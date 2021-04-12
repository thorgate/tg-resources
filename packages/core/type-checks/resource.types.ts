import { routeTemplate } from '@tg-resources/route-template';

import {
    Attachments,
    Query,
    RequestConfig,
    Resource,
    ResponseInterface,
} from '../src';

class TestResource extends Resource {
    [key: string]: any;

    protected createRequest<D>(
        _0: string,
        _1: string,
        _2: Query,
        _3: D | null,
        _4: Attachments,
        _5: RequestConfig
    ): any {}

    protected doRequest(
        _0: any,
        _1: (response: any, error: any) => void
    ): void {}

    protected setHeader(_0: any, _1: string, _2: string | null): any {}

    protected wrapResponse(_0: any, _1: any, _2: any): ResponseInterface {
        return (undefined as any);
    }
}

const resource1 = new TestResource("/generic/route");

resource1.fetch();
