import { FieldProps } from '@rjsf/utils';
import React from 'react';

/**
 * MultiSchemaField is being used for rendering different controls for a field with schema
 * that has subschemas defined with the oneOf or anyOf keywords. In our implementation we resrtict
 * schema mainteiners to use oneOf or anyOf keywords only to specify validation constraints.
 * This way we don't need additional controls and can render empty component to simplify the UI.
 */
const MultiSchemaField: React.FC<FieldProps> = () => {
  return null;
};

export default MultiSchemaField;
