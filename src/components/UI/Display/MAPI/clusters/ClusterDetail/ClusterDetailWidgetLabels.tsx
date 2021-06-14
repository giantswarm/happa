import ClusterLabels from 'Cluster/ClusterDetail/ClusterLabels/ClusterLabels';
import PropTypes from 'prop-types';
import React from 'react';

import { IClusterItem } from '../types';
import ClusterDetailWidget from './ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from './ClusterDetailWidgetOptionalValue';

interface IClusterDetailWidgetLabelsProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
      'title' | 'onChange'
    >,
    Pick<IClusterItem, 'labels'> {
  onChange: React.ComponentPropsWithoutRef<typeof ClusterLabels>['onChange'];
  errorMessage?: string;
  isLoading?: boolean;
}

const ClusterDetailWidgetLabels: React.FC<IClusterDetailWidgetLabelsProps> = ({
  labels,
  onChange,
  errorMessage,
  isLoading,
  ...props
}) => {
  return (
    <ClusterDetailWidget
      title='Labels'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
      }}
      {...props}
    >
      <ClusterDetailWidgetOptionalValue
        value={labels}
        loaderHeight={34}
        loaderWidth={350}
      >
        {(value) => (
          <ClusterLabels
            labels={value as Record<string, string>}
            onChange={onChange}
            errorMessage={errorMessage}
            isLoading={isLoading}
            showTitle={false}
          />
        )}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetLabels.propTypes = {
  onChange: PropTypes.func.isRequired,
  labels: PropTypes.object as PropTypes.Requireable<
    IClusterDetailWidgetLabelsProps['labels']
  >,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default ClusterDetailWidgetLabels;
