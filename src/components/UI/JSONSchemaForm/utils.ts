import {
  findSchemaDefinition,
  RJSFSchema,
  RJSFValidationError,
} from '@rjsf/utils';
import cleanDeep, { CleanOptions } from 'clean-deep';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';
import transform from 'lodash/transform';
import { pipe } from 'utils/helpers';

import { IIdConfigs } from '.';
import {
  TRANSFORMED_PROPERTY_KEY,
  TRANSFORMED_PROPERTY_VALUE,
} from './schemaUtils';

function transformRequiredArrayItemError(
  error: RJSFValidationError
): RJSFValidationError {
  if (error.name === 'type' && error.params.type === 'string') {
    const newMessage = 'must not be empty';
    const newStack = error.message
      ? error.stack.replace(error.message, newMessage)
      : error.stack;

    return {
      ...error,
      message: newMessage,
      stack: newStack,
    };
  }

  return error;
}

export function transformErrors(errors: RJSFValidationError[]) {
  // If property errors contain 'oneOf' error, filter out redundant 'const' errors
  // and modify 'oneOf' error to be alligned with 'enum' errors
  const errorsByProperty = Object.values(groupBy(errors, 'property')).map(
    (propertyErrors) => {
      const oneOfError = propertyErrors.find((error) => error.name === 'oneOf');
      if (!oneOfError) {
        return propertyErrors;
      }

      const allowedValues = propertyErrors
        .filter((error) => error.name === 'const')
        .map((error) => error.params.allowedValue);

      const newMessage = 'must be equal to one of the allowed values';
      const newStack = oneOfError.message
        ? oneOfError.stack.replace(oneOfError.message, newMessage)
        : oneOfError.stack;
      const patchedOneOfError = {
        ...oneOfError,
        message: newMessage,
        stack: newStack,
        params: { allowedValues },
      };

      return [
        patchedOneOfError,
        ...propertyErrors.filter(
          (error) => error.name !== 'const' && error.name !== 'oneOf'
        ),
      ];
    }
  );

  return flatten(errorsByProperty).map((err) =>
    pipe(err, transformRequiredArrayItemError)
  );
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
export const DEFAULT_OBJECT_VALUE = {};

function getImplicitDefaultValue(value: unknown) {
  switch (true) {
    case typeof value === 'string':
      return DEFAULT_STRING_VALUE;
    case typeof value === 'boolean':
      return DEFAULT_BOOLEAN_VALUE;
    case Array.isArray(value):
      return DEFAULT_ARRAY_VALUE;
    case isPlainObject(value):
      return DEFAULT_OBJECT_VALUE;
    default:
      return undefined;
  }
}

function getValueSchema(
  key: number,
  schema: RJSFSchema,
  rootSchema: RJSFSchema
) {
  const valueSchema =
    schema.type === 'array'
      ? schema.items && Array.isArray(schema.items)
        ? schema.items[key]
        : schema.items
      : schema.properties
      ? schema.properties[key]
      : undefined;

  if (
    typeof valueSchema !== 'undefined' &&
    typeof valueSchema !== 'boolean' &&
    valueSchema.$ref
  ) {
    return findSchemaDefinition(valueSchema.$ref, rootSchema);
  }

  return valueSchema;
}

export interface CleanPayloadOptions extends CleanOptions {
  cleanDefaultValues?: boolean;
  defaultValues?: unknown;
  isException?: (
    value: unknown,
    cleanValue: unknown,
    isArrayItem: boolean
  ) => boolean;
}

export function cleanPayload(
  object: unknown,
  objectSchema: RJSFSchema,
  rootSchema: RJSFSchema,
  options?: CleanPayloadOptions
): unknown {
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
      const valueSchema = getValueSchema(key, objectSchema, rootSchema);
      if (
        typeof valueSchema === 'undefined' ||
        typeof valueSchema === 'boolean'
      ) {
        return;
      }

      let newValue = value;
      const defaultValue =
        defaultValues?.[key as keyof typeof defaultValues] ??
        valueSchema.default ??
        getImplicitDefaultValue(value);

      if (Array.isArray(value)) {
        newValue = cleanPayload(value, valueSchema, rootSchema, {
          ...options,
          defaultValues: shouldCleanInnerDefaultValues(
            value,
            defaultValue as unknown[]
          )
            ? defaultValue
            : undefined,
        });

        if (
          ((cleanDefaultValues &&
            isEqualToDefaultValue(value, newValue, key, defaultValue)) ||
            (emptyArrays && isEmpty(newValue))) &&
          !isException(value, newValue, isArray)
        ) {
          return;
        }
      } else if (isPlainObject(value)) {
        newValue = cleanPayload(value, valueSchema, rootSchema, {
          ...options,
          defaultValues: defaultValue,
        });

        if (
          ((cleanDefaultValues &&
            isEqualToDefaultValue(value, newValue, key, defaultValue)) ||
            (emptyObjects && isEmpty(newValue))) &&
          !isException(value, newValue, isArray)
        ) {
          return;
        }
      } else {
        newValue = value;
        const cleanValue = cleanDeep({ value: newValue }, options).value;

        if (
          ((cleanDefaultValues &&
            isEqualToDefaultValue(value, newValue, key, defaultValue)) ||
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

function isEqualToDefaultValue(
  value: unknown,
  newValue: unknown,
  key: number | string,
  defaultValue: unknown
) {
  return (
    key !== TRANSFORMED_PROPERTY_KEY &&
    (isEqual(value, defaultValue) || isEqual(newValue, defaultValue))
  );
}

interface ITransformedObject {
  [TRANSFORMED_PROPERTY_KEY]: string;
  [TRANSFORMED_PROPERTY_VALUE]?: unknown;
  [key: string]: unknown;
}

function shouldCleanInnerDefaultValues(
  value: unknown[],
  defaultValue: unknown[]
) {
  if (!containsTransformedObjects(value)) {
    return false;
  }

  const valueKeys = value
    .map((item) => (item as ITransformedObject)[TRANSFORMED_PROPERTY_KEY])
    .sort();

  const defaultValueKeys = defaultValue
    .map((item) => (item as ITransformedObject)[TRANSFORMED_PROPERTY_KEY])
    .sort();

  return isEqual(valueKeys, defaultValueKeys);
}

function containsTransformedObjects(array: unknown[]) {
  return array.some(
    (item) =>
      isPlainObject(item) &&
      (item as {}).hasOwnProperty(TRANSFORMED_PROPERTY_KEY)
  );
}

export function transformArraysIntoObjects<T = {}>(
  object: Iterable<T> | unknown
): Iterable<T> | unknown {
  return transform(
    object as unknown[],
    (result: Record<string | number, unknown>, value, key) => {
      let newValue = value;

      if (Array.isArray(value)) {
        newValue = transformArraysIntoObjects<T>(value);

        if (containsTransformedObjects(newValue as unknown[])) {
          const entries = (newValue as ITransformedObject[]).map((item) => {
            const {
              [TRANSFORMED_PROPERTY_KEY]: itemKey,
              [TRANSFORMED_PROPERTY_VALUE]: itemValue,
              ...restItem
            } = item;

            return [itemKey, itemValue ?? restItem];
          });

          newValue = Object.fromEntries(entries);
        }
      } else if (isPlainObject(value)) {
        newValue = transformArraysIntoObjects<T>(value);
      }

      if (Array.isArray(result)) {
        result.push(newValue);
      } else {
        result[key] = newValue;
      }
    }
  );
}
