import { RJSFValidationError } from '@rjsf/utils';
import { pipe } from 'utils/helpers';

export const ID_SEPARATOR = '_';

function transformRequiredArrayItemError(
  error: RJSFValidationError
): RJSFValidationError {
  if (error.name === 'type' && error.params.type === 'string') {
    return {
      ...error,
      message: 'must not be empty',
      stack: `${error.property} must not be empty`,
    };
  }

  return error;
}

export function transformErrors(errors: RJSFValidationError[]) {
  return errors.map((err) => pipe(err, transformRequiredArrayItemError));
}

export function mapErrorPropertyToField(e: RJSFValidationError): string {
  if (!e.property) return '';

  return `root${(e.property[0] === '.'
    ? e.property
    : `.${e.property}`
  ).replaceAll('.', '_')}`;
}
