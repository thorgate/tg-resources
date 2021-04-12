import {
    ErrorType,
    AbortError,
    InvalidResponseCode,
    NetworkError,
    RequestValidationError,
} from './errors';

export function isAbortError(error: ErrorType): error is AbortError {
    return 'isAbortError' in error && error.isAbortError;
}

export function isInvalidResponseCode(
    error: ErrorType
): error is InvalidResponseCode {
    return 'isInvalidResponseCode' in error && error.isInvalidResponseCode;
}

export function isNetworkError(error: ErrorType): error is NetworkError {
    return 'isNetworkError' in error && error.isNetworkError;
}

export function isValidationError(
    error: ErrorType
): error is RequestValidationError {
    return 'isValidationError' in error && error.isValidationError;
}
