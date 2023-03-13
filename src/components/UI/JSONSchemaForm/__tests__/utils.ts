import cleanDeep from 'clean-deep';
import cloneDeep from 'lodash/cloneDeep';

import { cleanPayload, CleanPayloadOptions } from '../utils';

describe('JSONSchemaForm:utils', () => {
  describe('cleanPayload', () => {
    it('cleans objects with cleanDeep with given options when not given any exceptions', () => {
      const options: CleanPayloadOptions[] = [
        {},
        { emptyStrings: false, nullValues: false },
        { undefinedValues: false, emptyArrays: false },
        { emptyObjects: false, NaNValues: false },
      ];

      for (const option of options) {
        const expected = cleanDeep(createTestObject(), option);
        expect(cleanPayload(createTestObject(), option)).toStrictEqual(
          expected
        );
      }
    });

    it(`does not clean object values matching the given exception`, () => {
      const cases: Array<{
        object: unknown;
        options: CleanPayloadOptions;
        expected: unknown;
      }> = [
        {
          object: createTestObject(),
          options: {
            emptyStrings: false,
            isException: (value) => Array.isArray(value) && value.length > 0,
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

            testArrayObj: [{}, {}, { testNum: 1 }],
          },
        },
        {
          object: createTestObject(),
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
            testArrayObj: [{ testNum: 1 }],
          },
        },
        {
          object: createTestObject(),
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
            testArrayObj: [{}, {}, { testNum: 1 }],
          },
        },
      ];

      for (const c of cases) {
        expect(cleanPayload(c.object, c.options)).toStrictEqual(c.expected);
      }
    });
  });

  describe('cleanPayload with default values', () => {
    const cleanOptions = { emptyStrings: false, cleanDefaultValues: true };

    it('cleans string values correctly', () => {
      const examples = [
        {
          defaultValues: { field: '' },
          payload: { field: '' },
          expected: {},
        },
        {
          defaultValues: { field: 'some string field' },
          payload: { field: 'some string field' },
          expected: {},
        },
        {
          defaultValues: { field: '' },
          payload: { field: 'some string field' },
          expected: { field: 'some string field' },
        },
        {
          defaultValues: { field: 'some string field' },
          payload: { field: '' },
          expected: { field: '' },
        },
        {
          defaultValues: { field: 'some string field' },
          payload: { field: 'another string field' },
          expected: { field: 'another string field' },
        },
      ];

      for (const { defaultValues, payload, expected } of examples) {
        expect(
          cleanPayload(payload, { ...cleanOptions, defaultValues })
        ).toEqual(expected);
      }
    });

    it('implicitly uses empty string as default value for strings', () => {
      const examples = [
        {
          defaultValues: {},
          payload: { field: '' },
          expected: {},
        },
        {
          defaultValues: {},
          payload: { field: 'some string field' },
          expected: { field: 'some string field' },
        },
      ];

      for (const { defaultValues, payload, expected } of examples) {
        expect(
          cleanPayload(payload, { ...cleanOptions, defaultValues })
        ).toEqual(expected);
      }
    });

    it('cleans boolean values correctly', () => {
      const examples = [
        {
          defaultValues: { field: false },
          payload: { field: false },
          expected: {},
        },
        {
          defaultValues: { field: true },
          payload: { field: true },
          expected: {},
        },
        {
          defaultValues: { field: false },
          payload: { field: true },
          expected: { field: true },
        },
        {
          defaultValues: { field: true },
          payload: { field: false },
          expected: { field: false },
        },
      ];

      for (const { defaultValues, payload, expected } of examples) {
        expect(
          cleanPayload(payload, { ...cleanOptions, defaultValues })
        ).toEqual(expected);
      }
    });

    it('implicitly uses false as default value for booleans', () => {
      const examples = [
        {
          defaultValues: {},
          payload: { field: false },
          expected: {},
        },
        {
          defaultValues: {},
          payload: { field: true },
          expected: { field: true },
        },
      ];

      for (const { defaultValues, payload, expected } of examples) {
        expect(
          cleanPayload(payload, { ...cleanOptions, defaultValues })
        ).toEqual(expected);
      }
    });

    it('cleans number values correctly', () => {
      const examples = [
        {
          defaultValues: { field: 0 },
          payload: { field: 0 },
          expected: {},
        },
        {
          defaultValues: { field: 123 },
          payload: { field: 123 },
          expected: {},
        },
        {
          defaultValues: { field: 0 },
          payload: { field: 123 },
          expected: { field: 123 },
        },
        {
          defaultValues: { field: 123 },
          payload: { field: 0 },
          expected: { field: 0 },
        },
        {
          defaultValues: { field: 123 },
          payload: { field: 321 },
          expected: { field: 321 },
        },
      ];

      for (const { defaultValues, payload, expected } of examples) {
        expect(
          cleanPayload(payload, { ...cleanOptions, defaultValues })
        ).toEqual(expected);
      }
    });

    it('does not use implicit default for numbers', () => {
      const examples = [
        {
          defaultValues: {},
          payload: { field: 0 },
          expected: { field: 0 },
        },
        {
          defaultValues: {},
          payload: { field: 123 },
          expected: { field: 123 },
        },
      ];

      for (const { defaultValues, payload, expected } of examples) {
        expect(
          cleanPayload(payload, { ...cleanOptions, defaultValues })
        ).toEqual(expected);
      }
    });

    it('cleans inner objects', () => {
      const defaultValues = {
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
      };

      const expected = {
        stringField: 'some other string field',
        object: {
          objectBooleanField: true,
          innerObject: {
            innerObjectNumberField: 0,
          },
        },
      };

      expect(cleanPayload(payload, { ...cleanOptions, defaultValues })).toEqual(
        expected
      );
    });

    it('returns empty object if input object equals default values', () => {
      const defaultValues = {
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

      const payload = cloneDeep(defaultValues);

      expect(cleanPayload(payload, { ...cleanOptions, defaultValues })).toEqual(
        {}
      );
    });

    it('does not cleen inner arrays', () => {
      const defaultValues = {
        stringField: 'some string field',
        numberField: 123,
        booleanField: true,
        array: [
          {
            objectStringField: 'some object string field',
            objectNumberField: 0,
            objectBooleanField: false,
          },
        ],
      };

      const payload = {
        stringField: 'some string field',
        numberField: 123,
        booleanField: true,
        array: [
          {
            objectStringField: 'some object string field',
            objectNumberField: 123,
            objectBooleanField: false,
          },
          {
            objectBooleanField: true,
          },
        ],
      };

      const expected = {
        array: [
          {
            objectStringField: 'some object string field',
            objectNumberField: 123,
            objectBooleanField: false,
          },
          {
            objectBooleanField: true,
          },
        ],
      };

      expect(cleanPayload(payload, { ...cleanOptions, defaultValues })).toEqual(
        expected
      );
    });
  });
});

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
