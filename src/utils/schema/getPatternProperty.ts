import { RJSFSchema } from '@rjsf/utils';
import isPlainObject from 'lodash/isPlainObject';

export function getPatternProperty(schema: RJSFSchema) {
  if (schema.patternProperties && isPlainObject(schema.patternProperties)) {
    const [pattern, subschema] = Object.entries(schema.patternProperties)[0];

    return {
      pattern,
      subschema,
    };
  }

  return undefined;
}
