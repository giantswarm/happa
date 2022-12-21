import { WidgetProps } from '@rjsf/utils';
import { FormField } from 'grommet';
import React from 'react';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';

const ClusterNameWidget: React.FC<WidgetProps> = ({
  id,
  label,
  schema,
  value,
}) => {
  const { description } = schema;

  return (
    <FormField
      htmlFor={id}
      label={label}
      help={description}
      contentProps={{ border: false }}
    >
      <ClusterIDLabel
        clusterID={value}
        variant={ClusterIDLabelType.Name}
        aria-label={`Cluster name: ${value}`}
      />
    </FormField>
  );
};

export default ClusterNameWidget;
