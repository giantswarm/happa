import { Box, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

function pluralizeLabel(count: number | undefined, base: string) {
  if (count === 1) {
    return base;
  }

  return `${base}s`;
}

const Label = styled(Text)`
  text-transform: uppercase;
`;

interface IClusterDetailCounterProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  label: string;
  value?: number;
  pluralize?: boolean;
  color?: string;
  uppercase?: boolean;
}

const ClusterDetailCounter: React.FC<
  React.PropsWithChildren<IClusterDetailCounterProps>
> = ({ label, value, pluralize, color, uppercase = true, ...props }) => {
  const formattedLabel = pluralize ? pluralizeLabel(value, label) : label;

  let a11yLabel = `Loading ${formattedLabel}...`;
  if (typeof value === 'number' && value >= 0) {
    a11yLabel = `${value} ${formattedLabel}`;
  } else if (typeof value === 'number' && value < 0) {
    a11yLabel = `${formattedLabel} not available`;
  }

  return (
    <Box align='center' basis='100px' flex={{ grow: 1, shrink: 1 }} {...props}>
      <Box margin={{ bottom: 'xsmall' }}>
        <OptionalValue
          value={value}
          replaceEmptyValue={false}
          loaderHeight={22}
          loaderWidth={30}
        >
          {(counterValue) => (
            <Text size='xxlarge' color={color} aria-label={a11yLabel}>
              {counterValue === -1 ? <NotAvailable /> : counterValue}
            </Text>
          )}
        </OptionalValue>
      </Box>
      {uppercase ? (
        <Label color='text-weak' size='small'>
          {formattedLabel}
        </Label>
      ) : (
        <Text color='text-weak' size='small'>
          {formattedLabel}
        </Text>
      )}
    </Box>
  );
};

export default ClusterDetailCounter;
