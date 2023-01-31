import { ErrorListProps, RJSFSchema } from '@rjsf/utils';
import { Box, Paragraph } from 'grommet';
import React, { useMemo } from 'react';
import { FlashMessageType } from 'styles';
import FlashMessage from 'UI/Display/FlashMessage';

import { IFormContext } from '..';
import { isTouchedField } from '../FieldTemplate';
import { mapErrorPropertyToField } from '../utils';

const ErrorListTemplate: React.FC<
  ErrorListProps<RJSFSchema, RJSFSchema, IFormContext>
> = ({ errors, formContext }) => {
  const filteredErrors = useMemo(() => {
    if (!formContext || formContext.showAllErrors) return errors;

    return errors.filter((e) =>
      isTouchedField(mapErrorPropertyToField(e), formContext.touchedFields)
    );
  }, [errors, formContext]);

  return filteredErrors.length > 0 ? (
    <FlashMessage type={FlashMessageType.Danger}>
      <Paragraph size='xlarge'>Errors</Paragraph>
      <Box>
        {filteredErrors.map((error, idx) => (
          <Paragraph key={idx} fill>
            {error.stack}
          </Paragraph>
        ))}
      </Box>
    </FlashMessage>
  ) : null;
};

export default ErrorListTemplate;
