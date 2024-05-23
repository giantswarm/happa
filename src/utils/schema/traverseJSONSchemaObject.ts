import { RJSFSchema } from '@rjsf/utils';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Traverses a JSON schema object recursively
 * @param obj
 * @param processFn
 * @param path
 * @returns obj
 */
// eslint-disable-next-line complexity
export function traverseJSONSchemaObject(
  obj: RJSFSchema,
  processFn: (obj: RJSFSchema, path: string[]) => void,
  path: string[] = []
): Record<string, unknown> {
  switch (true) {
    case obj.type === 'object': {
      if (obj.$defs && typeof obj.$defs === 'object') {
        for (const [k, v] of Object.entries(
          obj.$defs as Record<string, unknown>
        )) {
          traverseJSONSchemaObject(v as Record<string, unknown>, processFn, [
            ...path,
            '$defs',
            k,
          ]);
        }
      }

      if (obj.properties && typeof obj.properties === 'object') {
        for (const [k, v] of Object.entries(
          obj.properties as Record<string, unknown>
        )) {
          traverseJSONSchemaObject(v as Record<string, unknown>, processFn, [
            ...path,
            'properties',
            k,
          ]);
        }
      }

      if (
        obj.additionalProperties &&
        typeof obj.additionalProperties === 'object'
      ) {
        traverseJSONSchemaObject(
          obj.additionalProperties as Record<string, unknown>,
          processFn,
          [...path, 'additionalProperties']
        );
      }

      if (obj.patternProperties && typeof obj.patternProperties === 'object') {
        const [pattern, subschema] = Object.entries(obj.patternProperties)[0];
        if (subschema && typeof subschema === 'object') {
          traverseJSONSchemaObject(
            subschema as Record<string, unknown>,
            processFn,
            [...path, 'patternProperties', pattern]
          );
        }
      }

      break;
    }

    case obj.type === 'array' && obj.items && isPlainObject(obj.items):
      traverseJSONSchemaObject(
        obj.items as Record<string, unknown>,
        processFn,
        [...path, 'items']
      );
      break;

    case obj.type === 'array' && obj.items && Array.isArray(obj.items):
      for (const [idx, x] of (
        obj.items as Record<string, unknown>[]
      ).entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(x, processFn, [
            ...path,
            'items',
            idx.toString(),
          ]);
        }
      }
      break;

    case obj.anyOf !== undefined:
      for (const [idx, x] of obj.anyOf.entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(x, processFn, [
            ...path,
            'anyOf',
            idx.toString(),
          ]);
        }
      }
      break;

    case obj.allOf !== undefined:
      for (const [idx, x] of obj.allOf.entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(x, processFn, [
            ...path,
            'allOf',
            idx.toString(),
          ]);
        }
      }
      break;

    case obj.oneOf !== undefined:
      for (const [idx, x] of obj.oneOf.entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(x, processFn, [
            ...path,
            'oneOf',
            idx.toString(),
          ]);
        }
      }
      break;
  }

  processFn(obj, path);

  return obj;
}
