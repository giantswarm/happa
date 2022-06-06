import { Box } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ValueLabel from 'UI/Display/ValueLabel';

const StyledValueLabel = styled(ValueLabel)`
  margin-bottom: 10px;
  line-height: 26px;
  height: 26px;
  font-size: 13px;
`;

interface IClusterListItemLabelsProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  labels?: IClusterLabelWithDisplayInfo[];
}

const ClusterListItemLabels: React.FC<
  React.PropsWithChildren<IClusterListItemLabelsProps>
> = ({ labels, ...props }) => {
  return (
    <Box {...props}>
      <OptionalValue value={labels} loaderHeight={34} loaderWidth={350}>
        {(value) => (
          <Box
            direction='row'
            wrap={true}
            align='center'
            margin={{ bottom: '-10px' }}
            gap='10px'
          >
            {value.map((label) => (
              <StyledValueLabel
                key={label.key}
                label={label.displayKey}
                value={label.displayValue}
                valueBackgroundColor={label.backgroundColor}
                valueTextColor={label.textColor}
                aria-label={`Label ${label.key} with value ${label.value}`}
              />
            ))}
          </Box>
        )}
      </OptionalValue>
    </Box>
  );
};

export default ClusterListItemLabels;
