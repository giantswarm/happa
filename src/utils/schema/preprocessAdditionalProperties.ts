import { findSchemaDefinition, RJSFSchema } from '@rjsf/utils';
import isPlainObject from 'lodash/isPlainObject';
import set from 'lodash/set';
import { generateUID } from 'MAPI/utils';

import { getPatternProperty } from './getPatternProperty';
import { getSubschema } from './getSubschema';
import { traverseJSONSchemaObject } from './traverseJSONSchemaObject';

type DefaultValue =
  | string
  | number
  | boolean
  | DefaultValueObject
  | DefaultValueArray
  | null;

interface DefaultValueObject {
  [key: string]: DefaultValue;
}

interface DefaultValueArray extends Array<DefaultValue> {}

export const TRANSFORMED_PROPERTY_KEY = 'transformedPropertyKey';
export const TRANSFORMED_PROPERTY_VALUE = 'transformedPropertyValue';

function transformObjectIntoArray(
  defaultValue: DefaultValueObject
): DefaultValueObject[] {
  return Object.entries(defaultValue).map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return {
        [TRANSFORMED_PROPERTY_KEY as string]: key,
        ...value,
      };
    }

    return {
      [TRANSFORMED_PROPERTY_KEY]: key,
      [TRANSFORMED_PROPERTY_VALUE]: value,
    };
  });
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

function transformSchema(
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

export function transformSchemaDefaultValues(
  object: DefaultValue,
  path: string[],
  rootSchema: RJSFSchema
): DefaultValue {
  const objectSchema = getSubschema(rootSchema, path);
  if (!object || !objectSchema) {
    return object;
  }

  if (objectSchema.type === 'array' && Array.isArray(object)) {
    return object.map((item) => {
      const itemPath = [...path, 'items'];

      return transformSchemaDefaultValues(item, itemPath, rootSchema);
    });
  }

  if (objectSchema.type === 'object' && typeof object === 'object') {
    const newObject = Object.fromEntries(
      Object.entries(object).map(([key, value]) => {
        let itemSchemaPath: string[] = [];
        const patternProperty = getPatternProperty(objectSchema);
        if (
          objectSchema.properties &&
          isPlainObject(objectSchema.properties) &&
          objectSchema.properties.hasOwnProperty(key)
        ) {
          itemSchemaPath = [...path, 'properties', key];
        } else if (
          objectSchema.additionalProperties &&
          isPlainObject(objectSchema.additionalProperties)
        ) {
          itemSchemaPath = [...path, 'additionalProperties'];
        } else if (patternProperty) {
          itemSchemaPath = [
            ...path,
            'patternProperties',
            patternProperty.pattern,
          ];
        }

        return [
          key,
          transformSchemaDefaultValues(value, itemSchemaPath, rootSchema),
        ];
      })
    );

    if (objectSchema.additionalProperties || objectSchema.patternProperties) {
      return transformObjectIntoArray(newObject);
    }

    return newObject;
  }

  return object;
}

export function isTransformedSchema(schema: RJSFSchema) {
  return (
    schema.type === 'array' &&
    schema.items &&
    typeof schema.items === 'object' &&
    !Array.isArray(schema.items) &&
    schema.items.properties &&
    schema.items.properties[TRANSFORMED_PROPERTY_KEY]
  );
}

export function preprocessAdditionalProperties(schema: RJSFSchema): RJSFSchema {
  const transformAdditionalPropertiesDefaultValues = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path?: string[];
  }) => {
    if (obj.default) {
      obj.default = transformSchemaDefaultValues(obj.default, path!, schema);
    }

    return { obj, path };
  };

  const transformAdditionalProperties = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path: string[];
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
      obj.items = transformSchema(subschema as RJSFSchema, schema, pattern);

      delete obj.additionalProperties;
      delete obj.patternProperties;
    }

    return { obj, path };
  };

  let patchedSchema = traverseJSONSchemaObject(schema, (obj, path) =>
    transformAdditionalPropertiesDefaultValues({ obj, path })
  );

  patchedSchema = traverseJSONSchemaObject(patchedSchema, (obj, path) =>
    transformAdditionalProperties({ obj, path })
  );

  return patchedSchema;
}
