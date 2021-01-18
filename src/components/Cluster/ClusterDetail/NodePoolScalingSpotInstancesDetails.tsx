import PropTypes from 'prop-types';
import * as React from 'react';
import { INodePool } from 'shared/types';

interface INodePoolScalingSpotInstancesDetailsProps {
  nodePool: INodePool;
}

const NodePoolScalingSpotInstancesDetails: React.FC<INodePoolScalingSpotInstancesDetailsProps> = ({
  nodePool,
}) => {
  const { node_spec } = nodePool;
  if (node_spec?.aws) {
    const instanceDistribution = node_spec.aws.instance_distribution;

    let baseCapacity = 'n/a';
    let spotPercentage = 'n/a';
    if (instanceDistribution) {
      baseCapacity = String(instanceDistribution.on_demand_base_capacity);
      spotPercentage = String(
        /* eslint-disable-next-line no-magic-numbers */
        100 - instanceDistribution.on_demand_percentage_above_base_capacity
      );
    }

    return (
      <>
        On-demand base capacity: {baseCapacity}
        <br />
        Spot instance percentage: {spotPercentage}
      </>
    );
  }

  return null;
};

NodePoolScalingSpotInstancesDetails.propTypes = {
  nodePool: (PropTypes.object as PropTypes.Requireable<INodePool>).isRequired,
};

export default NodePoolScalingSpotInstancesDetails;
