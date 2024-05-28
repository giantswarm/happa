import { RJSFSchema } from '@rjsf/utils';
import cleanDeep from 'clean-deep';

import {
  cleanPayload,
  cleanPayloadFromDefaults,
  CleanPayloadOptions,
} from '../utils';

describe('JSONSchemaForm:utils', () => {
  describe('cleanPayload', () => {
    it('cleans objects with cleanDeep with given options when not given any exceptions', () => {
      const options: CleanPayloadOptions[] = [
        {},
        { emptyStrings: false, nullValues: false },
        { undefinedValues: false, emptyArrays: false },
        { emptyObjects: false, NaNValues: false },
      ];

      const [testObject, schema] = createTestObject();

      for (const option of options) {
        const expected = cleanDeep(testObject, option);
        expect(cleanPayload(testObject, schema, schema, option)).toStrictEqual(
          expected
        );
      }
    });

    it('does not clean object values matching the given exception', () => {
      const cases: Array<{
        options: CleanPayloadOptions;
        expected: unknown;
      }> = [
        {
          options: {
            emptyStrings: false,
            isException: (_value, _cleanValue, isArrayItem) => isArrayItem,
          },
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

            testArrayObj: [{}, {}, { testNum: 1 }, {}],
          },
        },
        {
          options: {
            isException: (value) => value === null,
          },
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
            testArrayObj: [{ testNum: 1 }, { testNull: null }],
          },
        },
        {
          options: {
            emptyStrings: false,
            emptyObjects: false,
            isException: (value) => Array.isArray(value) && value === undefined,
          },
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
            testArrayObj: [{}, {}, { testNum: 1 }, {}],
          },
        },
      ];

      for (const c of cases) {
        const [testObject, schema] = createTestObject();
        expect(
          cleanPayload(testObject, schema, schema, c.options)
        ).toStrictEqual(c.expected);
      }
    });
  });

  describe('cleanPayloadFromDefaults', () => {
    it('cleans string values correctly', () => {
      const examples = [
        {
          defaultValue: '',
          payload: { field: '' },
          expected: {},
        },
        {
          defaultValue: 'some string field',
          payload: { field: 'some string field' },
          expected: {},
        },
        {
          defaultValue: '',
          payload: { field: 'some string field' },
          expected: { field: 'some string field' },
        },
        {
          defaultValue: 'some string field',
          payload: { field: '' },
          expected: { field: '' },
        },
        {
          defaultValue: 'some string field',
          payload: { field: 'another string field' },
          expected: { field: 'another string field' },
        },
      ];

      for (const { defaultValue, payload, expected } of examples) {
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              default: defaultValue,
            },
          },
        };

        expect(cleanPayloadFromDefaults(payload, schema, schema)).toEqual(
          expected
        );
      }
    });

    it('cleans boolean values correctly', () => {
      const examples = [
        {
          defaultValue: false,
          payload: { field: false },
          expected: {},
        },
        {
          defaultValue: true,
          payload: { field: true },
          expected: {},
        },
        {
          defaultValue: false,
          payload: { field: true },
          expected: { field: true },
        },
        {
          defaultValue: true,
          payload: { field: false },
          expected: { field: false },
        },
      ];

      for (const { defaultValue, payload, expected } of examples) {
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            field: {
              type: 'boolean',
              default: defaultValue,
            },
          },
        };

        expect(cleanPayloadFromDefaults(payload, schema, schema)).toEqual(
          expected
        );
      }
    });

    it('cleans number values correctly', () => {
      const examples = [
        {
          defaultValue: 0,
          payload: { field: 0 },
          expected: {},
        },
        {
          defaultValue: 123,
          payload: { field: 123 },
          expected: {},
        },
        {
          defaultValue: 0,
          payload: { field: 123 },
          expected: { field: 123 },
        },
        {
          defaultValue: 123,
          payload: { field: 0 },
          expected: { field: 0 },
        },
        {
          defaultValue: 123,
          payload: { field: 321 },
          expected: { field: 321 },
        },
        {
          defaultValue: 123,
          payload: { field: 0 },
          expected: { field: 0 },
        },
      ];

      for (const { defaultValue, payload, expected } of examples) {
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            field: {
              type: 'number',
              default: defaultValue,
            },
          },
        };

        expect(cleanPayloadFromDefaults(payload, schema, schema)).toEqual(
          expected
        );
      }
    });

    it('cleans arrays values correctly', () => {
      const examples = [
        {
          defaultValue: [],
          payload: { field: [] },
          expected: {},
        },
        {
          defaultValue: ['1', '2', '3'],
          payload: { field: ['1', '2', '3'] },
          expected: {},
        },
        {
          defaultValue: [],
          payload: { field: ['some string field'] },
          expected: { field: ['some string field'] },
        },
        {
          defaultValue: ['some string field'],
          payload: { field: [] },
          expected: { field: [] },
        },
        {
          defaultValue: ['some string field'],
          payload: { field: ['some string field', 'another string field'] },
          expected: { field: ['some string field', 'another string field'] },
        },
      ];

      for (const { defaultValue, payload, expected } of examples) {
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            field: {
              type: 'array',
              default: defaultValue,
              items: {
                type: 'string',
              },
            },
          },
        };

        expect(cleanPayloadFromDefaults(payload, schema, schema)).toEqual(
          expected
        );
      }
    });

    it('cleans inner objects', () => {
      const schema: RJSFSchema = {
        type: 'object',
        properties: {
          stringField: { type: 'string', default: 'some string field' },
          numberField: { type: 'number', default: 123 },
          booleanField: { type: 'boolean', default: true },
          object: {
            type: 'object',
            properties: {
              objectStringField: {
                type: 'string',
                default: 'some object string field',
              },
              objectNumberField: { type: 'number', default: 0 },
              objectBooleanField: { type: 'boolean', default: false },
              innerObject: {
                type: 'object',
                properties: {
                  innerObjectStringField: { type: 'string', default: '' },
                  innerObjectNumberField: { type: 'number', default: -1 },
                  innerObjectBooleanField: { type: 'boolean', default: true },
                },
              },
            },
          },
          array1: {
            type: 'array',
            default: [
              {
                stringField: 'some string field',
                numberField: 123,
                booleanField: true,
              },
            ],
            items: {
              type: 'object',
              properties: {
                stringField: { type: 'string' },
                numberField: { type: 'number' },
                booleanField: { type: 'boolean' },
              },
            },
          },
          array2: {
            type: 'array',
            default: [
              {
                stringField: 'some string field',
                numberField: 123,
                booleanField: true,
              },
            ],
            items: {
              type: 'object',
              properties: {
                stringField: { type: 'string' },
                emptyStringField: { type: 'string' },
                numberField: { type: 'number' },
                booleanField: { type: 'boolean' },
                innerArray: { type: 'array', items: { type: 'number' } },
                emptyInnerArray: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
      };

      const payload = {
        stringField: 'some other string field', // different from default
        numberField: 123,
        booleanField: true,
        object: {
          objectStringField: 'some object string field',
          objectNumberField: 0,
          objectBooleanField: true, // different from default
          innerObject: {
            innerObjectStringField: '',
            innerObjectNumberField: 0, // different from default
            innerObjectBooleanField: true,
          },
        },
        array1: [
          {
            stringField: 'some string field',
            numberField: 123,
            booleanField: true,
          },
        ],
        array2: [
          {
            stringField: 'another string field',
            emptyStringField: '',
            numberField: 123,
            booleanField: false,
            innerArray: [1, 2, 3],
            emptyInnerArray: [],
            emptyInnerObject: {},
          },
        ],
      };

      const expected = {
        stringField: 'some other string field',
        object: {
          objectBooleanField: true,
          innerObject: {
            innerObjectNumberField: 0,
          },
        },
        array2: [
          {
            stringField: 'another string field',
            emptyStringField: '',
            numberField: 123,
            booleanField: false,
            innerArray: [1, 2, 3],
          },
        ],
      };

      expect(cleanPayloadFromDefaults(payload, schema, schema)).toEqual(
        expected
      );
    });

    it('returns empty object if input object equals to default value', () => {
      const payload = {
        stringField: 'some string field',
        numberField: 123,
        booleanField: true,
        object: {
          objectStringField: 'some object string field',
          objectNumberField: 0,
          objectBooleanField: false,
          innerObject: {
            innerObjectStringField: '',
            innerObjectNumberField: -1,
            innerObjectBooleanField: true,
          },
        },
      };

      const schema: RJSFSchema = {
        type: 'object',
        properties: {
          stringField: { type: 'string', default: 'some string field' },
          numberField: { type: 'number', default: 123 },
          booleanField: { type: 'boolean', default: true },
          object: {
            type: 'object',
            properties: {
              objectStringField: {
                type: 'string',
                default: 'some object string field',
              },
              objectNumberField: { type: 'number', default: 0 },
              objectBooleanField: { type: 'boolean', default: false },
              innerObject: {
                type: 'object',
                properties: {
                  innerObjectStringField: { type: 'string', default: '' },
                  innerObjectNumberField: { type: 'number', default: -1 },
                  innerObjectBooleanField: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
      };

      expect(cleanPayloadFromDefaults(payload, schema, schema)).toEqual({});
    });
  });
});

function createTestObject(): [unknown, RJSFSchema] {
  const testObject = {
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
    testArrayObj: [{}, {}, { testNum: 1 }, { testNull: null }],
  };

  const schema = {
    type: 'object',
    properties: {
      testObj1: {
        type: 'object',
        properties: {
          testStr: { type: 'string' },
          testUndefined: { type: 'string' },
        },
      },
      testNull: { type: 'string' },
      testNum: { type: 'number' },
      testObj2: {
        type: 'object',
        properties: {
          testArrayNum: {
            type: 'array',
            items: { type: 'number' },
          },
          testArrayStr: {
            type: 'array',
            items: { type: 'string' },
          },
          testObj3: {
            type: 'object',
            properties: {
              testArrayUndefined: {
                type: 'array',
                items: { type: 'number' },
              },
              testArrayNull: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        },
      },
      testArrayObj: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            testNum: { type: 'number' },
            testNull: { type: 'number' },
          },
        },
      },
    },
  };

  return [testObject, schema as RJSFSchema];
}
