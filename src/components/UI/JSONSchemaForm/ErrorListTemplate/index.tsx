import { ErrorListProps, RJSFSchema } from '@rjsf/utils';
import React, { useMemo } from 'react';

import { IFormContext } from '..';
import { isTouchedField, mapErrorPropertyToField } from '../utils';
import ErrorList from './ErrorList';

const ErrorListTemplate: React.FC<
  ErrorListProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({ errors, formContext = {} as IFormContext }) => {
  const filteredErrors = useMemo(() => {
    return errors.filter((e) =>
      isTouchedField(
        mapErrorPropertyToField(e, formContext.idConfigs),
        formContext.touchedFields,
        formContext.idConfigs.idSeparator
      )
    );
  }, [errors, formContext]);

  return <ErrorList errors={filteredErrors} />;
};

export default ErrorListTemplate;
