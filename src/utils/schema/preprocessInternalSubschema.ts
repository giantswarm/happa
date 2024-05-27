import { RJSFSchema } from '@rjsf/utils';
import get from 'lodash/get';
import omit from 'lodash/omit';

import { traverseJSONSchemaObject } from './traverseJSONSchemaObject';

function getDefaultValueFromInternalSubschema(
  schema: RJSFSchema,
  path: string[]
) {
  return get(schema, ['properties', 'internal', ...path, 'default']);
}

export function preprocessInternalSubschema(schema: RJSFSchema): RJSFSchema {
  if (!schema.properties?.internal) {
    return schema;
  }

  const processDefaultValues = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path: string[];
  }) => {
    const defaultValue = getDefaultValueFromInternalSubschema(schema, path);

    if (defaultValue) {
      obj.default = defaultValue;
    }

    return { obj, path };
  };

  const patchedSchema = traverseJSONSchemaObject(schema, (obj, path) =>
    processDefaultValues({ obj, path })
  );

  return omit(patchedSchema, ['properties.internal']);
}
