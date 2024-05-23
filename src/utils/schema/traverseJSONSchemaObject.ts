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
  processFn: (obj: RJSFSchema, path?: string | null) => void,
  path: string = ''
): Record<string, unknown> {
  const formatPath = (
    basePath: string,
    additionalPath: string,
    index?: number
  ) => {
    const pathStr = basePath === '' ? additionalPath : `.${additionalPath}`;
    const indexStr = typeof index !== 'undefined' ? `[${index}]` : '';

    return `${basePath}${pathStr}${indexStr}`;
  };

  switch (true) {
    case obj.type === 'object': {
      if (obj.$defs && typeof obj.$defs === 'object') {
        for (const [k, v] of Object.entries(
          obj.$defs as Record<string, unknown>
        )) {
          traverseJSONSchemaObject(
            v as Record<string, unknown>,
            processFn,
            formatPath(path, `$defs.${k}`)
          );
        }
      }

      if (obj.properties && typeof obj.properties === 'object') {
        for (const [k, v] of Object.entries(
          obj.properties as Record<string, unknown>
        )) {
          traverseJSONSchemaObject(
            v as Record<string, unknown>,
            processFn,
            formatPath(path, `properties.${k}`)
          );
        }
      }

      break;
    }

    case obj.type === 'array' && obj.items && isPlainObject(obj.items):
      traverseJSONSchemaObject(
        obj.items as Record<string, unknown>,
        processFn,
        formatPath(path, 'items')
      );
      break;

    case obj.type === 'array' && obj.items && Array.isArray(obj.items):
      for (const [idx, x] of (
        obj.items as Record<string, unknown>[]
      ).entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(
            x,
            processFn,
            formatPath(path, 'items', idx)
          );
        }
      }
      break;

    case obj.anyOf !== undefined:
      for (const [idx, x] of obj.anyOf.entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(
            x,
            processFn,
            formatPath(path, 'anyOf', idx)
          );
        }
      }
      break;

    case obj.allOf !== undefined:
      for (const [idx, x] of obj.allOf.entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(
            x,
            processFn,
            formatPath(path, 'allOf', idx)
          );
        }
      }
      break;

    case obj.oneOf !== undefined:
      for (const [idx, x] of obj.oneOf.entries()) {
        if (typeof x === 'object') {
          traverseJSONSchemaObject(
            x,
            processFn,
            formatPath(path, 'oneOf', idx)
          );
        }
      }
      break;
  }

  processFn(obj, path);

  return obj;
}
