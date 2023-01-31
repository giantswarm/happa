import { RJSFValidationError } from '@rjsf/utils';
import { pipe } from 'utils/helpers';

function transformRequiredPropertyError(
  error: RJSFValidationError
): RJSFValidationError {
  const missingPropertyName = error.params.missingProperty;
  if (error.name === 'required' && missingPropertyName) {
    const newProperty = `${error.property}.${missingPropertyName}`;

    return {
      ...error,
      property: newProperty,
      message: 'must not be empty',
      stack: `${newProperty} must not be empty`,
    };
  }

  return error;
}

function transformRequiredArrayItemError(
  error: RJSFValidationError
): RJSFValidationError {
  if (error.name === 'type' && error.params.type === 'string') {
    return {
      ...error,
      message: `${error.property} must not be empty`,
      stack: `${error.property} must not be empty`,
    };
  }

  return error;
}

export function transformErrors(errors: RJSFValidationError[]) {
  return errors.map((err) =>
    pipe(err, transformRequiredPropertyError, transformRequiredArrayItemError)
  );
}
