import { SagaConfigTypeBase } from './types';


export const DEFAULT_CONFIG: SagaConfigTypeBase = {
    initializeSaga: false,

    mutateRequestConfig: null,

    onRequestError: null,
};
