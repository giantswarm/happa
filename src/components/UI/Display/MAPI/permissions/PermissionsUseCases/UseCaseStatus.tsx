import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';

const Icon = styled(Text)`
  font-size: 20px;
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
  let color = '';
  let icon = '';
  let text = '';
  if (typeof value === 'undefined') {
    color = theme.colors.gray;
    icon = 'fa fa-mixed-circle';
    text = 'Partial';
  } else if (value) {
    color = theme.colors.greenNew;
    icon = 'fa fa-check-circle';
    text = 'Yes';
  } else {
    color = theme.colors.error;
    icon = 'fa fa-close-circle';
    text = 'No';
  }

  return (
    <Box
      direction='row'
      align='center'
      width='74px'
      aria-label={
        organizationName
          ? `${useCaseName} for ${organizationName} organization permission status`
          : `${useCaseName} permission status`
      }
    >
      <Icon
        className={icon}
        color={color}
        role='presentation'
        aria-hidden='true'
      />

      <Text color={color} margin={{ left: 'small' }}>
        {text}
      </Text>
    </Box>
  );
};

export default UseCaseStatus;
