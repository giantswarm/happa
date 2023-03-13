import { RJSFSchema } from '@rjsf/utils';

import { preprocessSchema } from '../schemaUtils';

describe('JSONSchemaForm:schemaUtils', () => {
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
        preprocessSchema(createTestSchema() as RJSFSchema, [
          '.arrayFields',
          '.logic',
        ])
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
        preprocessSchema(createTestSchema() as RJSFSchema, [
          '.arrayFields',
          '.logic',
          '.booleanFields.active',
        ])
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
        preprocessSchema(createTestSchema() as RJSFSchema, [
          '.logic',
          '.booleanFields',
          '.arrayFields.arrayOfObjects.items.age',
        ])
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
        preprocessSchema(createTestSchema() as RJSFSchema, [
          '.booleanFields',
          '.arrayFields',
          '.logic.not',
          '.logic.oneOf',
        ])
      ).toStrictEqual(expected);
    });
  });
});

function createTestSchema() {
  return {
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
    },
    type: 'object',
  };
}
