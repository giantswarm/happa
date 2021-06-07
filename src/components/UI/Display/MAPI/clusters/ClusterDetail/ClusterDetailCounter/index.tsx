import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import NotAvailable from 'UI/Display/NotAvailable';

import ClusterDetailWidgetOptionalValue from '../ClusterDetailWidgetOptionalValue';

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
}

const ClusterDetailCounter: React.FC<IClusterDetailCounterProps> = ({
  label,
  value,
  pluralize,
  ...props
}) => {
  const formattedLabel = pluralize ? pluralizeLabel(value, label) : label;
  const a11yLabel =
    typeof value === 'number' && value >= 0
      ? `${value} ${formattedLabel}`
      : `Loading ${formattedLabel}...`;

  return (
    <Box align='center' basis='150px' flex={{ grow: 1, shrink: 1 }} {...props}>
      <Box margin={{ bottom: 'xsmall' }}>
        <ClusterDetailWidgetOptionalValue
          value={value}
          replaceEmptyValue={false}
          loaderHeight={22}
          loaderWidth={30}
        >
          {(counterValue) => (
            <Text size='xxlarge' aria-label={a11yLabel}>
              {counterValue === -1 ? <NotAvailable /> : counterValue}
            </Text>
          )}
        </ClusterDetailWidgetOptionalValue>
      </Box>
      <Label color='text-weak' size='small'>
        {formattedLabel}
      </Label>
    </Box>
  );
};

ClusterDetailCounter.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  pluralize: PropTypes.bool,
};

export default ClusterDetailCounter;
