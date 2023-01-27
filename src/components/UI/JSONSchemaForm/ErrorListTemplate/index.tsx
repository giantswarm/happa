import { ErrorListProps } from '@rjsf/utils';
import { Box, Paragraph } from 'grommet';
import React, { useContext, useMemo } from 'react';
import { FlashMessageType } from 'styles';
import FlashMessage from 'UI/Display/FlashMessage';

import { FormContext } from '..';

const ErrorListTemplate: React.FC<ErrorListProps> = ({ errors }) => {
  const formContext = useContext(FormContext);

  const filteredErrors = useMemo(() => {
    if (!formContext?.touchedFields || formContext.isSubmitAttempted)
      return errors;

    const touchedFieldsArray = Array.from(formContext.touchedFields);

    return errors.filter((e) =>
      touchedFieldsArray.some((field) =>
        e.property ? field.includes(e.property.replaceAll('.', '_')) : true
      )
    );
  }, [errors, formContext?.isSubmitAttempted, formContext?.touchedFields]);

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
