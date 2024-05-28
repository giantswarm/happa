import { RJSFSchema } from '@rjsf/utils';

import { transformArraysIntoObjects } from './transformArraysIntoObjects';

describe('transformArraysIntoObjects', () => {
  it('transforms inner arrays into objects', () => {
    const testObject = {
      arrayOfObjects: [
        {
          label: 'label/name',
          value: 'abcde',
        },
        {
          label: 'label/priority',
          value: 'high',
        },
      ],
      arrayOfTransformedObjects: [
        {
          transformedPropertyKey: 'label/name',
          transformedPropertyValue: 'abcde',
        },
        {
          transformedPropertyKey: 'label/priority',
          transformedPropertyValue: 'high',
        },
      ],
      arrayOfTransformedObjects2: [
        {
          transformedPropertyKey: 'abcde',
          instanceType: 'm5.xlarge',
          minSize: 4,
        },
        {
          transformedPropertyKey: 'qwert',
          instanceType: 'm5.8xlarge',
        },
      ],
      innerObject: {
        arrayOfTransformedObjects: [
          {
            transformedPropertyKey: 'label/name',
            transformedPropertyValue: 'abcde',
          },
          {
            transformedPropertyKey: 'label/priority',
            transformedPropertyValue: 'high',
          },
        ],
      },
    };

    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        arrayOfObjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
        arrayOfTransformedObjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              transformedPropertyKey: { type: 'string' },
              transformedPropertyValue: { type: 'string' },
            },
          },
        },
        arrayOfTransformedObjects2: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              transformedPropertyKey: { type: 'string' },
              instanceType: { type: 'string' },
              minSize: { type: 'number' },
            },
          },
        },
        innerObject: {
          type: 'object',
          properties: {
            arrayOfTransformedObjects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  transformedPropertyKey: { type: 'string' },
                  transformedPropertyValue: { type: 'string' },
                },
              },
            },
          },
        },
      },
    };

    const expected = {
      arrayOfObjects: [
        {
          label: 'label/name',
          value: 'abcde',
        },
        {
          label: 'label/priority',
          value: 'high',
        },
      ],
      arrayOfTransformedObjects: {
        'label/name': 'abcde',
        'label/priority': 'high',
      },
      arrayOfTransformedObjects2: {
        abcde: {
          instanceType: 'm5.xlarge',
          minSize: 4,
        },
        qwert: {
          instanceType: 'm5.8xlarge',
        },
      },
      innerObject: {
        arrayOfTransformedObjects: {
          'label/name': 'abcde',
          'label/priority': 'high',
        },
      },
    };

    expect(transformArraysIntoObjects(testObject, schema, schema)).toEqual(
      expected
    );
  });
});
