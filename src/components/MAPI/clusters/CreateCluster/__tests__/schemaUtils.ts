import { RJSFSchema } from '@rjsf/utils';
import cleanDeep, { CleanOptions } from 'clean-deep';
import testSchema from 'UI/JSONSchemaForm/test.schema.json';

import { cleanDeepWithException, preprocessSchema } from '../schemaUtils';

describe('schemaUtils', () => {
  describe('cleanDeepWithException', () => {
    it('cleans objects with cleanDeep with given options when not given any exceptions', () => {
      const options: CleanOptions[] = [
        {},
        { emptyStrings: false, nullValues: false },
        { undefinedValues: false, emptyArrays: false },
        { emptyObjects: false, NaNValues: false },
      ];

      for (const option of options) {
        const expected = cleanDeep(createTestObject(), option);
        expect(
          cleanDeepWithException(createTestObject(), option)
        ).toStrictEqual(expected);
      }
    });

    it(`does not clean object values matching the given exception`, () => {
      const cases: Array<{
        object: unknown;
        options: CleanOptions;
        exceptions: (v: unknown) => boolean;
        expected: unknown;
      }> = [
        {
          object: createTestObject(),
          options: { emptyStrings: false },
          exceptions: (value) => Array.isArray(value) && value.length > 0,
          expected: {
            testObj1: {
              testStr: 'some string',
            },
            testNum: 0,
            testObj2: {
              testArrayNum: [0, 1, 2, 3],
              testArrayStr: ['', 'some string'],
              testObj3: {
                testArrayUndefined: [undefined, undefined],
                testArrayNull: [null],
              },
            },

            testArrayObj: [{}, {}, { testNum: 1 }],
          },
        },
        {
          object: createTestObject(),
          options: {},
          exceptions: (value) => value === null,
          expected: {
            testObj1: {
              testStr: 'some string',
            },
            testNull: null,
            testNum: 0,
            testObj2: {
              testArrayNum: [0, 1, 2, 3],
              testArrayStr: ['some string'],
              testObj3: {
                testArrayNull: [null],
              },
            },
            testArrayObj: [{ testNum: 1 }],
          },
        },
        {
          object: createTestObject(),
          options: { emptyStrings: false, emptyObjects: false },
          exceptions: (value) => Array.isArray(value) && value === undefined,
          expected: {
            testObj1: {
              testStr: 'some string',
            },
            testNum: 0,
            testObj2: {
              testArrayNum: [0, 1, 2, 3],
              testArrayStr: ['', 'some string'],
              testObj3: {},
            },
            testArrayObj: [{}, {}, { testNum: 1 }],
          },
        },
      ];

      for (const c of cases) {
        expect(
          cleanDeepWithException(c.object, c.options, c.exceptions)
        ).toStrictEqual(c.expected);
      }
    });
  });

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
          '.objectFields',
          '.numericFields',
          '.stringFields',
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
          '.objectFields',
          '.numericFields',
          '.stringFields',
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
          '.objectFields',
          '.numericFields',
          '.stringFields',
          '.booleanFields',
          '.arrayFields.arrayOfStrings',
          '.arrayFields.arrayMinMaxItems',
          '.arrayFields.arrayOfObjectsWithTitle',
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
          '.objectFields',
          '.numericFields',
          '.stringFields',
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
  return structuredClone(testSchema);
}

function createTestObject() {
  return {
    testObj1: {
      testStr: 'some string',
      testUndefined: undefined,
    },
    testNull: null,
    testNum: 0,
    testObj2: {
      testArrayNum: [0, 1, 2, 3],
      testArrayStr: ['', 'some string'],
      testObj3: {
        testArrayUndefined: [undefined, undefined],
        testArrayNull: [null],
      },
    },
    testArrayObj: [{}, {}, { testNum: 1 }],
  };
}
