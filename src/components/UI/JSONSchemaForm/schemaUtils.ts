import { findSchemaDefinition, RJSFSchema } from '@rjsf/utils';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import omit from 'lodash/omit';
import set from 'lodash/set';
import { generateUID } from 'MAPI/utils';
import { pipe, traverseJSONSchemaObject } from 'utils/helpers';

export const TRANSFORMED_PROPERTY_KEY = 'transformedPropertyKey';
export const TRANSFORMED_PROPERTY_VALUE = 'transformedPropertyValue';
const TRANSFORMED_PROPERTY_COMMENT = 'transformedProperty';

export function isTransformedProperty(schema: RJSFSchema) {
  return schema.$comment === TRANSFORMED_PROPERTY_COMMENT;
}

function addKeyProperty(schema: RJSFSchema, pattern?: string): RJSFSchema {
  return {
    ...schema,
    properties: {
      [TRANSFORMED_PROPERTY_KEY]: {
        type: 'string',
        title: 'Key',
        pattern,
      },
      ...schema.properties,
    },
    required: [...(schema.required ?? []), TRANSFORMED_PROPERTY_KEY],
  };
}

function transformSubschema(
  schema: RJSFSchema,
  rootSchema?: RJSFSchema,
  pattern?: string
): RJSFSchema {
  const referencedSchema = schema.$ref
    ? findSchemaDefinition(schema.$ref, rootSchema)
    : undefined;

  if (referencedSchema && referencedSchema.type === 'object') {
    const newReferencedSchema = addKeyProperty(referencedSchema, pattern);
    const newReferencedSchemaId = generateUID(5);
    const newReferencedSchemaPath = `$defs/${newReferencedSchemaId}`;
    set(rootSchema!, ['$defs', newReferencedSchemaId], newReferencedSchema);

    return {
      ...schema,
      $ref: `#/${newReferencedSchemaPath}`,
    };
  }

  if (schema.type === 'object') {
    return addKeyProperty(schema, pattern);
  }

  return {
    type: 'object',
    properties: {
      [TRANSFORMED_PROPERTY_KEY]: {
        type: 'string',
        title: 'Key',
        pattern,
      },
      [TRANSFORMED_PROPERTY_VALUE]: {
        title: 'Value',
        ...schema,
      },
    },
    required: [TRANSFORMED_PROPERTY_KEY, TRANSFORMED_PROPERTY_VALUE],
  };
}

interface JSONSchemaObjectDefaultValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

function transformDefaultValue(defaultValue?: JSONSchemaObjectDefaultValue) {
  if (typeof defaultValue !== 'undefined' && isPlainObject(defaultValue)) {
    return Object.entries(defaultValue).map(([key, value]) => {
      if (isPlainObject(value)) {
        return {
          [TRANSFORMED_PROPERTY_KEY]: key,
          ...value,
        };
      }

      return {
        [TRANSFORMED_PROPERTY_KEY]: key,
        [TRANSFORMED_PROPERTY_VALUE]: value,
      };
    });
  }

  return undefined;
}

function getDefaultValueFromInternals(
  schema: RJSFSchema,
  path?: string | null
) {
  return path ? get(schema, `properties.internal.${path}.default`) : undefined;
}

export function preprocessSchema(
  schema: RJSFSchema,
  fieldsToRemove: string[] = ['properties.internal']
): RJSFSchema {
  const originalSchema = cloneDeep(schema);
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

  const transformAdditionalProperties = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path?: string | null;
  }) => {
    if (
      obj.type === 'object' &&
      (isPlainObject(obj.additionalProperties) ||
        isPlainObject(obj.patternProperties))
    ) {
      const [pattern, subschema] = obj.additionalProperties
        ? [undefined, obj.additionalProperties]
        : Object.entries(obj.patternProperties!)[0];

      obj.type = 'array';
      obj.items = transformSubschema(
        subschema as RJSFSchema,
        patchedSchema,
        pattern
      );
      obj.$comment = TRANSFORMED_PROPERTY_COMMENT;

      const defaultValue =
        obj.default ?? getDefaultValueFromInternals(originalSchema, path);
      obj.default = transformDefaultValue(
        defaultValue as JSONSchemaObjectDefaultValue
      );

      delete obj.additionalProperties;
      delete obj.patternProperties;
    }

    return { obj, path };
  };

  return traverseJSONSchemaObject(patchedSchema, (obj, path) =>
    pipe({ obj, path }, processSubschemas, transformAdditionalProperties)
  );
}
