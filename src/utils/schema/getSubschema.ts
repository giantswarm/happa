import { findSchemaDefinition, mergeObjects, RJSFSchema } from '@rjsf/utils';

export function getSubschema(schema: RJSFSchema, path: string[]) {
  let subschema = schema;

  for (const p of path) {
    subschema = subschema[p];
    if (subschema.$ref) {
      const refSchema = findSchemaDefinition(subschema.$ref, schema);

      subschema = mergeObjects(refSchema, subschema);
    }
  }

  return subschema;
}
