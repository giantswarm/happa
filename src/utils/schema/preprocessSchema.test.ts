import { RJSFSchema } from '@rjsf/utils';
import pick from 'lodash/pick';

import { preprocessSchema } from './preprocessSchema';

describe('preprocessSchema', () => {
  it('removes fields at the root level', () => {
    const expected = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: {
        booleanFields: {
          properties: {
            active: {
              type: 'boolean',
            },
            enabled: {
              description: 'Boolean field with title and description.',
              title: 'Enabled',
              type: 'boolean',
            },
          },
          title: 'Boolean fields',
          type: 'object',
        },
      },
      type: 'object',
    };

    expect(
      preprocessSchema(
        createTestSchema([
          'properties.arrayFields',
          'properties.booleanFields',
          'properties.logic',
        ]) as RJSFSchema,
        ['properties.arrayFields', 'properties.logic']
      )
    ).toStrictEqual(expected);
  });

  it('removes nested fields', () => {
    const expected = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: {
        booleanFields: {
          properties: {
            enabled: {
              description: 'Boolean field with title and description.',
              title: 'Enabled',
              type: 'boolean',
            },
          },
          title: 'Boolean fields',
          type: 'object',
        },
      },
      type: 'object',
    };

    expect(
      preprocessSchema(
        createTestSchema([
          'properties.arrayFields',
          'properties.booleanFields',
          'properties.logic',
        ]) as RJSFSchema,
        [
          'properties.arrayFields',
          'properties.logic',
          'properties.booleanFields.properties.active',
        ]
      )
    ).toStrictEqual(expected);
  });

  it('removes nested fields of items', () => {
    const expected = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: {
        arrayFields: {
          properties: {
            arrayOfObjects: {
              items: {
                properties: {
                  name: {
                    type: 'string',
                  },
                },
                type: 'object',
              },
              title: 'Array of objects',
              type: 'array',
            },
          },
          title: 'Array fields',
          type: 'object',
        },
      },
      type: 'object',
    };

    expect(
      preprocessSchema(
        createTestSchema([
          'properties.arrayFields',
          'properties.booleanFields',
          'properties.logic',
        ]) as RJSFSchema,
        [
          'properties.logic',
          'properties.booleanFields',
          'properties.arrayFields.properties.arrayOfObjects.items.properties.age',
        ]
      )
    ).toStrictEqual(expected);
  });

  it('uses the first non-deprecated subschema for anyOf', () => {
    const expected = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: {
        logic: {
          description: `Uses of 'anyOf', 'oneOf', and 'not'.`,
          properties: {
            anyOf: {
              properties: {
                anyOfDeprecated: {
                  description:
                    'Only the second declared subschema (number, minimum=3) should be visible.',
                  minimum: 3,
                  title: `Property with subschemas using 'anyOf' and 'deprecated'`,
                  type: 'number',
                },
                anyOfSimple: {
                  description:
                    'Only the first declared subschema (string, minLength=3) should be visible.',
                  minLength: 3,
                  title: `Property with two subschemas using 'anyOf'`,
                  type: 'string',
                },
              },
              title: `Subschema choice using 'anyOf'`,
              type: 'object',
            },
          },
          title: 'Logic and subschemas',
          type: 'object',
        },
      },
      type: 'object',
    };

    expect(
      preprocessSchema(createTestSchema(['properties.logic']) as RJSFSchema)
    ).toStrictEqual(expected);
  });

  it('transforms additionalProperties into arrays', () => {
    const expected = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: {
        objectsWithAdditionalProperties: {
          type: 'object',
          properties: {
            objectOfStrings: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'transformedPropertyKey',
                  'transformedPropertyValue',
                ],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                  },
                  transformedPropertyValue: {
                    type: 'string',
                    title: 'Value',
                  },
                },
              },
            },
            objectOfObjects: {
              type: 'array',
              items: {
                type: 'object',
                required: ['transformedPropertyKey'],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                  },
                  age: {
                    type: 'number',
                  },
                  name: {
                    type: 'string',
                  },
                },
              },
            },
            objectOfStringsWithDefault: {
              type: 'array',
              default: [
                {
                  transformedPropertyKey: 'label/name',
                  transformedPropertyValue: 'abcde',
                },
                {
                  transformedPropertyKey: 'label/priority',
                  transformedPropertyValue: 'high',
                },
              ],
              items: {
                type: 'object',
                required: [
                  'transformedPropertyKey',
                  'transformedPropertyValue',
                ],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                  },
                  transformedPropertyValue: {
                    type: 'string',
                    title: 'Value',
                  },
                },
              },
            },
            objectOfObjectsWithDefault: {
              type: 'array',
              default: [
                {
                  transformedPropertyKey: 'abcde',
                  instanceType: 'm5.xlarge',
                  minSize: 4,
                },
              ],
              items: {
                type: 'object',
                required: ['transformedPropertyKey'],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                  },
                  instanceType: {
                    type: 'string',
                  },
                  minSize: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
      type: 'object',
    };

    expect(
      preprocessSchema(
        createTestSchema([
          'properties.objectsWithAdditionalProperties',
        ]) as RJSFSchema
      )
    ).toEqual(expected);
  });

  it('transforms patternProperties into arrays', () => {
    const expected = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: {
        objectsWithPatternProperties: {
          type: 'object',
          properties: {
            objectOfStrings: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'transformedPropertyKey',
                  'transformedPropertyValue',
                ],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                    pattern: '^[a-z]{5,10}$',
                  },
                  transformedPropertyValue: {
                    type: 'string',
                    title: 'Value',
                  },
                },
              },
            },
            objectOfObjects: {
              type: 'array',
              items: {
                type: 'object',
                required: ['transformedPropertyKey'],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                    pattern: '^[a-z]{5,10}$',
                  },
                  age: {
                    type: 'number',
                  },
                  name: {
                    type: 'string',
                  },
                },
              },
            },
            objectOfStringsWithDefault: {
              type: 'array',
              default: [
                {
                  transformedPropertyKey: 'label/name',
                  transformedPropertyValue: 'abcde',
                },
                {
                  transformedPropertyKey: 'label/priority',
                  transformedPropertyValue: 'high',
                },
              ],
              items: {
                type: 'object',
                required: [
                  'transformedPropertyKey',
                  'transformedPropertyValue',
                ],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                    pattern: '^[a-z]{5,10}$',
                  },
                  transformedPropertyValue: {
                    type: 'string',
                    title: 'Value',
                  },
                },
              },
            },
            objectOfObjectsWithDefault: {
              type: 'array',
              default: [
                {
                  transformedPropertyKey: 'abcde',
                  instanceType: 'm5.xlarge',
                  minSize: 4,
                },
              ],
              items: {
                type: 'object',
                required: ['transformedPropertyKey'],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                    pattern: '^[a-z]{5,10}$',
                  },
                  instanceType: {
                    type: 'string',
                  },
                  minSize: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
      type: 'object',
    };

    expect(
      preprocessSchema(
        createTestSchema([
          'properties.objectsWithPatternProperties',
        ]) as RJSFSchema
      )
    ).toEqual(expected);
  });

  it('looks for default values in properties.internal', () => {
    const expected = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: {
        objectsWithDefaultsInInternals: {
          type: 'object',
          properties: {
            objectOfStrings: {
              type: 'array',
              default: [
                {
                  transformedPropertyKey: 'label/name',
                  transformedPropertyValue: 'abcde',
                },
                {
                  transformedPropertyKey: 'label/priority',
                  transformedPropertyValue: 'high',
                },
              ],
              items: {
                type: 'object',
                required: [
                  'transformedPropertyKey',
                  'transformedPropertyValue',
                ],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                  },
                  transformedPropertyValue: {
                    type: 'string',
                    title: 'Value',
                  },
                },
              },
            },
            objectOfObjects: {
              type: 'array',
              default: [
                {
                  transformedPropertyKey: 'abcde',
                  instanceType: 'm5.xlarge',
                  minSize: 4,
                },
              ],
              items: {
                type: 'object',
                required: ['transformedPropertyKey'],
                properties: {
                  transformedPropertyKey: {
                    type: 'string',
                    title: 'Key',
                    pattern: '^[a-z]{5,10}$',
                  },
                  instanceType: {
                    type: 'string',
                  },
                  minSize: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
      type: 'object',
    };

    expect(
      preprocessSchema(
        createTestSchema([
          'properties.objectsWithDefaultsInInternals',
          'properties.internal',
        ]) as RJSFSchema
      )
    ).toEqual(expected);
  });
});

function createTestSchema(fieldsToPick: string[] = []) {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    properties: {
      arrayFields: {
        properties: {
          arrayOfObjects: {
            items: {
              properties: {
                age: {
                  type: 'number',
                },
                name: {
                  type: 'string',
                },
              },
              type: 'object',
            },
            title: 'Array of objects',
            type: 'array',
          },
        },
        title: 'Array fields',
        type: 'object',
      },
      booleanFields: {
        properties: {
          active: {
            type: 'boolean',
          },
          enabled: {
            description: 'Boolean field with title and description.',
            title: 'Enabled',
            type: 'boolean',
          },
        },
        title: 'Boolean fields',
        type: 'object',
      },
      numericFields: {
        type: 'object',
        properties: {
          integerField: {
            type: 'integer',
          },
          numberField: {
            type: 'number',
          },
        },
        title: 'Numeric fields',
      },
      logic: {
        description: `Uses of 'anyOf', 'oneOf', and 'not'.`,
        properties: {
          anyOf: {
            properties: {
              anyOfDeprecated: {
                anyOf: [
                  {
                    deprecated: true,
                    minLength: 3,
                    type: 'string',
                  },
                  {
                    minimum: 3,
                    type: 'number',
                  },
                ],
                description:
                  'Only the second declared subschema (number, minimum=3) should be visible.',
                title: `Property with subschemas using 'anyOf' and 'deprecated'`,
              },
              anyOfSimple: {
                anyOf: [
                  {
                    minLength: 3,
                    type: 'string',
                  },
                  {
                    minimum: 3,
                    type: 'number',
                  },
                ],
                description:
                  'Only the first declared subschema (string, minLength=3) should be visible.',
                title: `Property with two subschemas using 'anyOf'`,
              },
            },
            title: `Subschema choice using 'anyOf'`,
            type: 'object',
          },
        },
        title: 'Logic and subschemas',
        type: 'object',
      },
      objectsWithAdditionalProperties: {
        type: 'object',
        properties: {
          objectOfStrings: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
          },
          objectOfObjects: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                },
                name: {
                  type: 'string',
                },
              },
            },
          },
          objectOfStringsWithDefault: {
            type: 'object',
            default: {
              'label/name': 'abcde',
              'label/priority': 'high',
            },
            additionalProperties: {
              type: 'string',
            },
          },
          objectOfObjectsWithDefault: {
            type: 'object',
            default: {
              abcde: {
                instanceType: 'm5.xlarge',
                minSize: 4,
              },
            },
            additionalProperties: {
              type: 'object',
              properties: {
                instanceType: {
                  type: 'string',
                },
                minSize: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      objectsWithPatternProperties: {
        type: 'object',
        properties: {
          objectOfStrings: {
            type: 'object',
            patternProperties: {
              '^[a-z]{5,10}$': {
                type: 'string',
              },
            },
          },
          objectOfObjects: {
            type: 'object',
            patternProperties: {
              '^[a-z]{5,10}$': {
                type: 'object',
                properties: {
                  age: {
                    type: 'number',
                  },
                  name: {
                    type: 'string',
                  },
                },
              },
            },
          },
          objectOfStringsWithDefault: {
            type: 'object',
            default: {
              'label/name': 'abcde',
              'label/priority': 'high',
            },
            patternProperties: {
              '^[a-z]{5,10}$': {
                type: 'string',
              },
            },
          },
          objectOfObjectsWithDefault: {
            type: 'object',
            default: {
              abcde: {
                instanceType: 'm5.xlarge',
                minSize: 4,
              },
            },
            patternProperties: {
              '^[a-z]{5,10}$': {
                type: 'object',
                properties: {
                  instanceType: {
                    type: 'string',
                  },
                  minSize: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
      objectsWithDefaultsInInternals: {
        type: 'object',
        properties: {
          objectOfStrings: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
          },
          objectOfObjects: {
            type: 'object',
            patternProperties: {
              '^[a-z]{5,10}$': {
                type: 'object',
                properties: {
                  instanceType: {
                    type: 'string',
                  },
                  minSize: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
      internal: {
        type: 'object',
        properties: {
          objectsWithDefaultsInInternals: {
            type: 'object',
            properties: {
              objectOfStrings: {
                default: {
                  'label/name': 'abcde',
                  'label/priority': 'high',
                },
              },
              objectOfObjects: {
                default: {
                  abcde: {
                    instanceType: 'm5.xlarge',
                    minSize: 4,
                  },
                },
              },
            },
          },
        },
      },
    },
    type: 'object',
  };

  return fieldsToPick.length === 0
    ? schema
    : pick(schema, ['$schema', 'type', ...fieldsToPick]);
}
