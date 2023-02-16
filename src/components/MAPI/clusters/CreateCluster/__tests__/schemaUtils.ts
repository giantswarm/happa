import cleanDeep, { CleanOptions } from 'clean-deep';

import { cleanDeepWithException } from '../schemaUtils';

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
