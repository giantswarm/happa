import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';
import ScreenReaderText from 'UI/Display/ScreenReaderText';

const Icon = styled(Text)`
  font-size: 20px;
`;

const IconSmall = styled(Text)`
  font-size: 17px;
`;

interface IUseCaseStatusProps {
  value?: boolean;
  useCaseName: string;
  organizationName?: string;
}

const UseCaseStatus: React.FC<IUseCaseStatusProps> = ({
  value,
  useCaseName,
  organizationName,
}) => {
  return (
    <Box
      direction='row'
      align='center'
      aria-label={
        organizationName
          ? `${useCaseName} for ${organizationName} organization permission status`
          : `${useCaseName} permission status`
      }
    >
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

      {typeof value !== 'undefined' ? (
        <Text
          color={value ? theme.colors.greenNew : theme.colors.error}
          size='16px'
          margin={{ left: 'small' }}
        >
          {value ? 'Yes' : 'No'}
        </Text>
      ) : (
        <ScreenReaderText>Various</ScreenReaderText>
      )}
    </Box>
  );
};

export default UseCaseStatus;
