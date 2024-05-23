import { RJSFSchema } from '@rjsf/utils';

import { traverseJSONSchemaObject } from './traverseJSONSchemaObject';

describe('traverseJSONSchemaObject', () => {
  it('performs specified action for an object', () => {
    const schema: RJSFSchema = {
      type: 'object',
      title: 'object title',
    };

    const expected = {
      type: 'object',
      title: 'OBJECT TITLE',
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('performs specified action for object $defs', () => {
    const schema: RJSFSchema = {
      $defs: {
        title: { type: 'object', title: 'object title' },
      },
      title: 'object title',
      type: 'object',
    };

    const expected = {
      $defs: {
        title: { type: 'object', title: 'OBJECT TITLE' },
      },
      title: 'OBJECT TITLE',
      type: 'object',
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('recursively performs specified action for each property of an object', () => {
    const schema: RJSFSchema = {
      type: 'object',
      title: 'object title',
      properties: {
        firstProp: {
          type: 'object',
          title: 'first prop title',
        },
        secondProp: {
          type: 'object',
          title: 'second prop title',
          properties: {
            firstProp: {
              type: 'object',
              title: 'first prop title',
            },
          },
        },
      },
    };

    const expected = {
      type: 'object',
      title: 'OBJECT TITLE',
      properties: {
        firstProp: {
          type: 'object',
          title: 'FIRST PROP TITLE',
        },
        secondProp: {
          type: 'object',
          title: 'SECOND PROP TITLE',
          properties: {
            firstProp: {
              type: 'object',
              title: 'FIRST PROP TITLE',
            },
          },
        },
      },
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('performs specified action for an array', () => {
    const schema: RJSFSchema = {
      type: 'array',
      title: 'array title',
    };

    const expected = {
      type: 'array',
      title: 'ARRAY TITLE',
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('performs specified action for array items object', () => {
    const schema: RJSFSchema = {
      type: 'array',
      title: 'array title',
      items: {
        type: 'object',
        title: 'object title',
        properties: {
          firstProp: {
            type: 'object',
            title: 'first prop title',
          },
          secondProp: {
            type: 'object',
            title: 'second prop title',
          },
        },
      },
    };

    const expected = {
      type: 'array',
      title: 'ARRAY TITLE',
      items: {
        type: 'object',
        title: 'OBJECT TITLE',
        properties: {
          firstProp: {
            type: 'object',
            title: 'FIRST PROP TITLE',
          },
          secondProp: {
            type: 'object',
            title: 'SECOND PROP TITLE',
          },
        },
      },
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('performs specified action for each subschema of anyOf property', () => {
    const schema: RJSFSchema = {
      title: 'object title',
      anyOf: [
        {
          type: 'string',
          title: 'first subschema title',
        },
        {
          type: 'integer',
          title: 'second subschema title',
        },
      ],
    };

    const expected = {
      title: 'OBJECT TITLE',
      anyOf: [
        {
          type: 'string',
          title: 'FIRST SUBSCHEMA TITLE',
        },
        {
          type: 'integer',
          title: 'SECOND SUBSCHEMA TITLE',
        },
      ],
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('performs specified action for each subschema of oneOf property', () => {
    const schema: RJSFSchema = {
      title: 'object title',
      oneOf: [
        {
          type: 'string',
          title: 'first subschema title',
        },
        {
          type: 'integer',
          title: 'second subschema title',
        },
      ],
    };

    const expected = {
      title: 'OBJECT TITLE',
      oneOf: [
        {
          type: 'string',
          title: 'FIRST SUBSCHEMA TITLE',
        },
        {
          type: 'integer',
          title: 'SECOND SUBSCHEMA TITLE',
        },
      ],
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('performs specified action for each subschema of allOf property', () => {
    const schema: RJSFSchema = {
      title: 'object title',
      allOf: [
        {
          type: 'string',
          title: 'first subschema title',
        },
        {
          type: 'integer',
          title: 'second subschema title',
        },
      ],
    };

    const expected = {
      title: 'OBJECT TITLE',
      allOf: [
        {
          type: 'string',
          title: 'FIRST SUBSCHEMA TITLE',
        },
        {
          type: 'integer',
          title: 'SECOND SUBSCHEMA TITLE',
        },
      ],
    };

    expect(
      traverseJSONSchemaObject(
        schema,
        (obj) => (obj.title = obj.title?.toUpperCase())
      )
    ).toStrictEqual(expected);
  });

  it('calls specified action with the correct subschema path', () => {
    const schema: RJSFSchema = {
      $defs: {
        firstProp: { type: 'object' },
      },
      properties: {
        firstProp: {
          type: 'object',
        },
        secondProp: {
          type: 'object',
          properties: {
            firstProp: {
              type: 'object',
            },
          },
        },
        arrayProp: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              firstProp: {
                type: 'object',
              },
              secondProp: {
                type: 'object',
              },
            },
          },
        },
        anyOfProp: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'object',
              properties: {
                firstProp: {
                  type: 'object',
                },
                secondProp: {
                  type: 'object',
                },
              },
            },
          ],
        },
        oneOfProp: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'object',
              properties: {
                firstProp: {
                  type: 'object',
                },
                secondProp: {
                  type: 'object',
                },
              },
            },
          ],
        },
        allOfProp: {
          allOf: [
            {
              type: 'string',
            },
            {
              type: 'object',
              properties: {
                firstProp: {
                  type: 'object',
                },
                secondProp: {
                  type: 'object',
                },
              },
            },
          ],
        },
      },
      type: 'object',
    };

    const callback = jest.fn();
    const paths = [
      ['$defs', 'firstProp'],
      ['properties', 'firstProp'],
      ['properties', 'secondProp', 'properties', 'firstProp'],
      ['properties', 'secondProp'],
      ['properties', 'arrayProp', 'items', 'properties', 'firstProp'],
      ['properties', 'arrayProp', 'items', 'properties', 'secondProp'],
      ['properties', 'arrayProp', 'items'],
      ['properties', 'arrayProp'],
      ['properties', 'anyOfProp', 'anyOf', '0'],
      ['properties', 'anyOfProp', 'anyOf', '1', 'properties', 'firstProp'],
      ['properties', 'anyOfProp', 'anyOf', '1', 'properties', 'secondProp'],
      ['properties', 'anyOfProp', 'anyOf', '1'],
      ['properties', 'anyOfProp'],
      ['properties', 'oneOfProp', 'oneOf', '0'],
      ['properties', 'oneOfProp', 'oneOf', '1', 'properties', 'firstProp'],
      ['properties', 'oneOfProp', 'oneOf', '1', 'properties', 'secondProp'],
      ['properties', 'oneOfProp', 'oneOf', '1'],
      ['properties', 'oneOfProp'],
      ['properties', 'allOfProp', 'allOf', '0'],
      ['properties', 'allOfProp', 'allOf', '1', 'properties', 'firstProp'],
      ['properties', 'allOfProp', 'allOf', '1', 'properties', 'secondProp'],
      ['properties', 'allOfProp', 'allOf', '1'],
      ['properties', 'allOfProp'],
      [],
    ];

    traverseJSONSchemaObject(schema, callback);

    expect(callback).toHaveBeenCalledTimes(paths.length);
    for (const [idx, path] of paths.entries()) {
      expect(callback).toHaveBeenNthCalledWith(
        idx + 1,
        expect.anything(),
        path
      );
    }
  });
});
