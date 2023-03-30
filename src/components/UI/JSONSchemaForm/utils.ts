import { RJSFValidationError } from '@rjsf/utils';
import cleanDeep, { CleanOptions } from 'clean-deep';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
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

export const DEFAULT_STRING_VALUE = '';
export const DEFAULT_BOOLEAN_VALUE = false;
export const DEFAULT_NUMERIC_VALUE = 0;
export const DEFAULT_ARRAY_VALUE = [];

function getImplicitDefaultValue(value: unknown) {
  switch (true) {
    case typeof value === 'string':
      return DEFAULT_STRING_VALUE;
    case typeof value === 'boolean':
      return DEFAULT_BOOLEAN_VALUE;
    case Array.isArray(value):
      return DEFAULT_ARRAY_VALUE;
    default:
      return undefined;
  }
}

export interface CleanPayloadOptions<T = {}> extends CleanOptions {
  cleanDefaultValues?: boolean;
  defaultValues?: Iterable<T> | unknown;
  isException?: (
    value: unknown,
    cleanValue: unknown,
    isArrayItem: boolean
  ) => boolean;
}

export function cleanPayload<T = {}>(
  object: Iterable<T> | unknown,
  options?: CleanPayloadOptions<T>
): Iterable<T> | unknown {
  const {
    emptyArrays = true,
    emptyObjects = true,
    undefinedValues = true,
    cleanDefaultValues = false,
    defaultValues,
    isException = () => false,
  } = options ?? {};

  const isArray = Array.isArray(object);

  return transform(
    object as unknown[],
    // eslint-disable-next-line complexity
    (result: Record<string | number, unknown>, value, key) => {
      let newValue = value;
      const defaultValue = cleanDefaultValues
        ? defaultValues?.[key as keyof typeof defaultValues] ??
          getImplicitDefaultValue(value)
        : undefined;

      if (Array.isArray(value)) {
        newValue = cleanPayload<unknown>(value, {
          ...options,
          defaultValues: undefined,
        });

        if (
          ((cleanDefaultValues && isEqual(value, defaultValue)) ||
            (cleanDefaultValues && isEqual(newValue, defaultValue)) ||
            (emptyArrays && isEmpty(newValue))) &&
          !isException(value, newValue, isArray)
        ) {
          return;
        }
      } else if (isPlainObject(value)) {
        newValue = cleanPayload<unknown>(value, {
          ...options,
          defaultValues: defaultValue,
        });

        if (
          emptyObjects &&
          isEmpty(newValue) &&
          !isException(value, newValue, isArray)
        ) {
          return;
        }
      } else {
        newValue = value;
        const cleanValue = cleanDeep({ value: newValue }, options).value;

        if (
          ((cleanDefaultValues && newValue === defaultValue) ||
            (newValue !== undefined && cleanValue === undefined) ||
            (undefinedValues && cleanValue === undefined)) &&
          !isException(value, newValue, isArray)
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
