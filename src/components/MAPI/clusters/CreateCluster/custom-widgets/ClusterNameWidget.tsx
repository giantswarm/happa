import { WidgetProps } from '@rjsf/utils';
import React from 'react';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';

const ClusterNameWidget: React.FC<WidgetProps> = ({ value }) => {
  return (
    <ClusterIDLabel
      clusterID={value}
      variant={ClusterIDLabelType.Name}
      aria-label={`Cluster name: ${value}`}
    />
  );
};

export default ClusterNameWidget;
