import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';

const Icon = styled(Text)`
  font-size: 20px;
`;

const IconSmall = styled(Text)`
  font-size: 17px;
`;

interface IUseCaseStatusProps {
  value?: boolean;
  displayText?: boolean;
}

const UseCaseStatus: React.FC<IUseCaseStatusProps> = ({
  value,
  displayText = true,
}) => {
  return (
    <Box direction='row' align='center'>
      {typeof value === 'undefined' ? (
        <IconSmall
          className='fa fa-radio-checked'
          role='presentation'
          aria-hidden='true'
        />
      ) : (
        <Icon
          color={value ? theme.colors.greenNew : theme.colors.error}
          className={value ? 'fa fa-check-circle' : 'fa fa-close-circle'}
          role='presentation'
          aria-hidden='true'
        />
      )}

      {displayText && typeof value !== 'undefined' && (
        <Text
          color={value ? theme.colors.greenNew : theme.colors.error}
          size='16px'
          margin={{ left: 'small' }}
        >
          {value ? 'Yes' : 'No'}
        </Text>
      )}
    </Box>
  );
};

export default UseCaseStatus;
