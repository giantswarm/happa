import { WidgetProps } from '@rjsf/utils';
import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import { Box } from 'grommet';
import React from 'react';

const EMPTY_VALUE_NAME = 'None';

const InstanceTypeWidget: React.FC<WidgetProps> = ({
  value,
  options,
  onChange,
}) => {
  const handleChange = (instanceType: string) => {
    onChange(
      instanceType === EMPTY_VALUE_NAME ? options.emptyValue : instanceType
    );
  };

  return (
    <Box margin={{ bottom: 'small' }}>
      <InstanceTypeSelector
        allowEmptyValue
        emptyValueName={EMPTY_VALUE_NAME}
        selectedInstanceType={
          value === options.emptyValue ? EMPTY_VALUE_NAME : value
        }
        selectInstanceType={handleChange}
      />
    </Box>
  );
};

export default InstanceTypeWidget;
