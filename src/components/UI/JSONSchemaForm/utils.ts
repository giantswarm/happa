import { RJSFValidationError } from '@rjsf/utils';
import cleanDeep, { CleanOptions } from 'clean-deep';
import isEmpty from 'lodash/isEmpty';
import isPlainObject from 'lodash/isPlainObject';
import transform from 'lodash/transform';
import { pipe } from 'utils/helpers';

import { IIdConfigs } from '.';

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

export function mapErrorPropertyToField(
  e: RJSFValidationError,
  idConfigs: IIdConfigs
): string {
  if (!e.property) return '';

  return `${idConfigs.idPrefix}${(e.property[0] === '.'
    ? e.property
    : `.${e.property}`
  ).replaceAll('.', idConfigs.idSeparator)}`;
}

export function isTouchedField(
  id: string,
  touchedFields: string[],
  idSeparator: string
): boolean {
  return touchedFields.some((field) =>
    `${field}${idSeparator}`.includes(`${id}${idSeparator}`)
  );
}

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const idIndexRegExp = (idSeparator: string) =>
  new RegExp(`(${escapeRegExp(idSeparator)}\\d+)$`, 'g');

export function isFieldArrayItem(id: string, idSeparator: string) {
  return idIndexRegExp(idSeparator).test(id);
}

export function getArrayItemIndex(id: string, idSeparator: string) {
  const indexMatchArray = id.match(idIndexRegExp(idSeparator));

  return indexMatchArray
    ? parseInt(indexMatchArray[0].replace(idSeparator, ''))
    : -1;
}

export function cleanDeepWithException<T>(
  object: Iterable<T> | unknown,
  options?: CleanOptions,
  isException?: (value: unknown) => boolean
): Iterable<T> | unknown {
  const {
    emptyArrays = true,
    emptyObjects = true,
    undefinedValues = true,
  } = options ?? {};

  return transform(
    object as unknown[],
    (result: Record<string | number, unknown>, value, key) => {
      // if it matches the exception rule, don't continue to clean
      if (isException && isException(value)) {
        result[key] = value;

        return;
      }

      let newValue = value;
      if (Array.isArray(value) || isPlainObject(value)) {
        newValue = cleanDeepWithException<unknown>(value, options, isException);
        if (
          ((isPlainObject(newValue) && emptyObjects) ||
            (Array.isArray(newValue) && emptyArrays)) &&
          isEmpty(newValue)
        ) {
          return;
        }
      } else {
        newValue =
          value !== 0 && !value ? cleanDeep({ value }, options).value : value;
        if (
          newValue === undefined &&
          (value !== undefined || undefinedValues)
        ) {
          return;
        }
      }

      if (Array.isArray(result)) {
        result.push(newValue);
      } else {
        result[key] = newValue;
      }
    }
  );
}
