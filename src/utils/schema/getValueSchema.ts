import { findSchemaDefinition, mergeObjects, RJSFSchema } from '@rjsf/utils';

export function getValueSchema(
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
    const refSchema = findSchemaDefinition(valueSchema.$ref, rootSchema);

    return mergeObjects(refSchema, valueSchema);
  }

  return valueSchema;
}
