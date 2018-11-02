import 'jest-extended';

import { ParentValidationErrorInterface, ValidationErrorInterface } from '../src';


interface ExpectValidationError {
    fieldName?: string | number;
    strVal?: string;
    type?: any;
}

interface ExpectParentValidationError extends ExpectValidationError {
    allowNonField?: boolean;
}

/**
 * @param error
 * @param strVal If defined compared against error.toString result
 * @param type If null error must be null, else error must be instance of type
 * @param fieldName Field name to check for error
 */
export const expectValidationError = (error: ValidationErrorInterface | null, { strVal, type, fieldName }: ExpectValidationError) => {
    if (type !== undefined) {
        if (type === null) {
            expect(error).toBeNull();
        } else {
            expect(error).toBeInstanceOf(type);
        }
    }

    if (error && fieldName !== undefined) {
        expect(error.fieldName).toEqual(fieldName);
    }

    if (error && strVal !== undefined) {
        expect(error.toString).toBeFunction();
        expect(error.toString()).toEqual(strVal);
    }
};

type FieldName = string | number | undefined;

export const expectParentValidationError = (
    parent: ValidationErrorInterface | null, fieldName: FieldName, { strVal, type, allowNonField }: ExpectParentValidationError
) => {
    if (parent instanceof ParentValidationErrorInterface) {
        expect(parent.getError).toBeFunction();
        expectValidationError(parent.getError(fieldName, allowNonField || false), { strVal, type });
    } else {
        expectValidationError(parent, { strVal, type });
    }
};
