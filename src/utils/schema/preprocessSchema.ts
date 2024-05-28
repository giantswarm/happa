import { RJSFSchema } from '@rjsf/utils';
import omit from 'lodash/omit';

import { preprocessAdditionalProperties } from './preprocessAdditionalProperties';
import { preprocessAnyOfOneOfProperties } from './preprocessAnyOfOneOfProperties';
import { preprocessImplicitDefaultValues } from './preprocessImplicitDefaultValues';
import { preprocessInternalSubschema } from './preprocessInternalSubschema';

export function preprocessSchema(
  schema: RJSFSchema,
  fieldsToRemove: string[] = []
): RJSFSchema {
  let patchedSchema = omit(schema, fieldsToRemove);

  patchedSchema = preprocessInternalSubschema(patchedSchema);

  patchedSchema = preprocessAnyOfOneOfProperties(patchedSchema);

  patchedSchema = preprocessAdditionalProperties(patchedSchema);

  patchedSchema = preprocessImplicitDefaultValues(patchedSchema);

  return patchedSchema;
}
