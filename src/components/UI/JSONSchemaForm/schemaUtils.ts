import { RJSFSchema } from '@rjsf/utils';
import omit from 'lodash/omit';
import { pipe, traverseJSONSchemaObject } from 'utils/helpers';

export function preprocessSchema(
  schema: RJSFSchema,
  fieldsToRemove: string[] = ['properties.internal']
): RJSFSchema {
  const patchedSchema = omit(schema, fieldsToRemove);

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

  return traverseJSONSchemaObject(patchedSchema, (obj, path) =>
    pipe({ obj, path }, processSubschemas)
  );
}
