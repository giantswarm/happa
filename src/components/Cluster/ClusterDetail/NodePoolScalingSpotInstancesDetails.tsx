import PropTypes from 'prop-types';
import * as React from 'react';
import { Providers } from 'shared/constants';
import { INodePool, PropertiesOf } from 'shared/types';

interface INodePoolScalingSpotInstancesDetailsProps {
  nodePool: INodePool;
  provider: PropertiesOf<typeof Providers>;
}

const NodePoolScalingSpotInstancesDetails: React.FC<INodePoolScalingSpotInstancesDetailsProps> = ({
  nodePool,
  provider,
}) => {
  const { node_spec } = nodePool;
  if (provider === Providers.AWS) {
    const instanceDistribution = node_spec?.aws?.instance_distribution;

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
  } else if (provider === Providers.AZURE) {
    const spotInstancesEnabled =
      nodePool.node_spec?.azure?.spot_instances?.enabled ?? false;
    let headline = 'Spot instances disabled';
    if (spotInstancesEnabled) {
      headline = 'Spot instances enabled';
    }

    let maxPriceRow = '';
    if (spotInstancesEnabled) {
      const maxPrice = node_spec?.azure?.spot_instances?.max_price ?? 0;
      if (maxPrice > 0) {
        maxPriceRow = `Using maximum price: $${maxPrice}`;
      } else {
        maxPriceRow = `Using current on-demand pricing as maximum`;
      }
    }

    return (
      <>
        {headline}
        {maxPriceRow && (
          <>
            <br />
            {maxPriceRow}
          </>
        )}
      </>
    );
  }

  return null;
};

NodePoolScalingSpotInstancesDetails.propTypes = {
  nodePool: (PropTypes.object as PropTypes.Requireable<INodePool>).isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
};

export default NodePoolScalingSpotInstancesDetails;
