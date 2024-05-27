import { RJSFSchema } from '@rjsf/utils';
import { cleanPayload } from 'UI/JSONSchemaForm/utils';

import { traverseJSONSchemaObject } from './traverseJSONSchemaObject';

export function preprocessImplicitDefaultValues(
  schema: RJSFSchema
): RJSFSchema {
  const processDefaultValues = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path: string[];
  }) => {
    // Clean out implicit default values from objects and arrays
    if ((obj.type === 'array' || obj.type === 'object') && obj.default) {
      const { default: defaultValue, ...objSchema } = obj;
      obj.default = cleanPayload(
        defaultValue,
        objSchema,
        schema
      ) as typeof defaultValue;
    }

    return { obj, path };
  };

  const patchedSchema = traverseJSONSchemaObject(schema, (obj, path) =>
    processDefaultValues({ obj, path })
  );

  return patchedSchema;
}
