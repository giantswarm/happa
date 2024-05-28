import { RJSFSchema } from '@rjsf/utils';
import isPlainObject from 'lodash/isPlainObject';
import transform from 'lodash/transform';

import { getValueSchema } from './getValueSchema';
import {
  isTransformedSchema,
  TRANSFORMED_PROPERTY_KEY,
  TRANSFORMED_PROPERTY_VALUE,
} from './preprocessAdditionalProperties';

export interface ITransformedObject {
  [TRANSFORMED_PROPERTY_KEY]: string;
  [TRANSFORMED_PROPERTY_VALUE]?: unknown;
  [key: string]: unknown;
}

export function transformArraysIntoObjects(
  object: unknown,
  objectSchema: RJSFSchema,
  rootSchema: RJSFSchema
): unknown {
  return transform(
    object as unknown[],
    (result: Record<string | number, unknown>, value, key) => {
      const valueSchema = getValueSchema(key, objectSchema, rootSchema);
      if (
        typeof valueSchema === 'undefined' ||
        typeof valueSchema === 'boolean'
      ) {
        return;
      }

      let newValue = value;

      if (Array.isArray(value)) {
        newValue = transformArraysIntoObjects(value, valueSchema, rootSchema);

        if (isTransformedSchema(valueSchema)) {
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
        newValue = transformArraysIntoObjects(value, valueSchema, rootSchema);
      }

      if (Array.isArray(result)) {
        result.push(newValue);
      } else {
        result[key] = newValue;
      }
    }
  );
}
