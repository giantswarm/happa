import { RJSFSchema } from '@rjsf/utils';
import { pipe, traverseJSONSchemaObject } from 'utils/helpers';

export function preprocessSchema(
  schema: RJSFSchema,
  fieldsToRemove: string[] = ['.internal']
): RJSFSchema {
  const removeFields = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path?: string | null;
  }) => {
    for (const field of fieldsToRemove) {
      const fieldParentPath = field.slice(0, field.lastIndexOf('.'));
      const fieldKey = field.slice(field.lastIndexOf('.') + 1);

      if (fieldParentPath === path) {
        delete obj.properties?.[fieldKey];
      }
    }

    return { obj, path };
  };

  const processSubschemas = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path?: string | null;
  }) => {
    // If the type is not defined and the schema uses 'anyOf' or 'oneOf',
    // use first not deprecated subschema from the list
    if (!obj.type && (obj.anyOf || obj.oneOf)) {
      const subschemas = (obj.anyOf || obj.oneOf || []).filter(
        (subschema) =>
          typeof subschema === 'object' && !(subschema as RJSFSchema).deprecated
      );

      if (subschemas.length > 0) {
        Object.entries(subschemas[0]).forEach(([key, value]) => {
          obj[key] = value;
        });
      }

      delete obj.anyOf;
      delete obj.oneOf;
    }

    return { obj, path };
  };

  return traverseJSONSchemaObject(schema, (obj, path) =>
    pipe({ obj, path }, removeFields, processSubschemas)
  );
}
