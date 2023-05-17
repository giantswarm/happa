import { ErrorListProps, RJSFSchema } from '@rjsf/utils';
import React from 'react';

import { IFormContext } from '..';
import ValidationStatus from './ValidationStatus';

const ErrorListTemplate: React.FC<
  ErrorListProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({ formContext = {} as IFormContext }) => {
  return <ValidationStatus formContext={formContext} />;
};

export default ErrorListTemplate;
