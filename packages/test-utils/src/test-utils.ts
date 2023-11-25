class NoErrorThrownError extends Error {}

export const getError = async <TError>(
    call: () => unknown
): Promise<TError> => {
    try {
        await call();

        throw new NoErrorThrownError();
    } catch (error) {
        return error as TError;
    }
};
