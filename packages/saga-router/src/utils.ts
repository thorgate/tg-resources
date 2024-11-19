import { SagaResourceFetchMethods, SagaResourcePostMethods } from './types';

export const isSagaFetchMethod = (
    method: string
): method is SagaResourceFetchMethods =>
    ['getEffect', 'fetchEffect', 'headEffect', 'optionsEffect'].includes(
        method
    );

export const isSagaPostMethod = (
    method: string
): method is SagaResourcePostMethods =>
    ['postEffect', 'patchEffect', 'putEffect', 'delEffect'].includes(method);
