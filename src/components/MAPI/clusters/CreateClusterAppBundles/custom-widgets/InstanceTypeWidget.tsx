import { RJSFSchema, WidgetProps } from '@rjsf/utils';
import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import { Box, Text } from 'grommet';
import React from 'react';
import BaseInputTemplate from 'UI/JSONSchemaForm/BaseInputTemplate';

import { ICreateClusterFormContext } from '..';

const EMPTY_VALUE_NAME = 'None';

const InstanceTypeWidget: React.FC<
  WidgetProps<RJSFSchema, RJSFSchema, ICreateClusterFormContext>
> = (props) => {
  /**
   * Fallback to the BaseInputTemplate when instance type meta data is not available
   * for selected schema
   *
   * TODO: Delete fallback when create cluster form prototype is gone
   */
  const { formContext = {} as ICreateClusterFormContext } = props;
  if (formContext.schemaProvider !== window.config.info.general.provider) {
    return (
      <Box margin={{ bottom: 'small' }}>
        <BaseInputTemplate {...props} />
        <Text color='status-warning' size='small'>
          Custom instance type widget is not available for selected schema on
          this installation
        </Text>
      </Box>
    );
  }

  const { value, options, onChange } = props;

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
