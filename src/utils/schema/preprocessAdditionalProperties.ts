import { findSchemaDefinition, RJSFSchema } from '@rjsf/utils';
import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import set from 'lodash/set';
import { generateUID } from 'MAPI/utils';

import { traverseJSONSchemaObject } from './traverseJSONSchemaObject';

export const TRANSFORMED_PROPERTY_KEY = 'transformedPropertyKey';
export const TRANSFORMED_PROPERTY_VALUE = 'transformedPropertyValue';
const TRANSFORMED_PROPERTY_COMMENT = 'transformedProperty';

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

function getDefaultValueFromInternals(schema: RJSFSchema, path: string[]) {
  return get(schema, ['properties', 'internal', ...path, 'default']);
}

export function isTransformedProperty(schema: RJSFSchema) {
  return schema.$comment === TRANSFORMED_PROPERTY_COMMENT;
}

export function preprocessAdditionalProperties(
  schema: RJSFSchema,
  originalSchema: RJSFSchema
): RJSFSchema {
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
      obj.items = transformSubschema(subschema as RJSFSchema, schema, pattern);
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

  const patchedSchema = traverseJSONSchemaObject(schema, (obj, path) =>
    transformAdditionalProperties({ obj, path })
  );

  return patchedSchema;
}
