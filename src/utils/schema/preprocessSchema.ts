import { RJSFSchema } from '@rjsf/utils';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';

import { preprocessAdditionalProperties } from './preprocessAdditionalProperties';
import { preprocessAnyOfOneOfProperties } from './preprocessAnyOfOneOfProperties';
import { preprocessImplicitDefaultValues } from './preprocessImplicitDefaultValues';

export function preprocessSchema(
  schema: RJSFSchema,
  fieldsToRemove: string[] = ['properties.internal']
): RJSFSchema {
  const originalSchema = cloneDeep(schema);
  let patchedSchema = omit(schema, fieldsToRemove);

  patchedSchema = preprocessAnyOfOneOfProperties(patchedSchema);

  patchedSchema = preprocessAdditionalProperties(patchedSchema, originalSchema);

  patchedSchema = preprocessImplicitDefaultValues(patchedSchema);

  return patchedSchema;
}
