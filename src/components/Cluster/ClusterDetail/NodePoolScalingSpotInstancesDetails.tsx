import { Providers } from 'model/constants';
import * as React from 'react';
import NotAvailable from 'UI/Display/NotAvailable';

interface INodePoolScalingSpotInstancesDetailsProps {
  nodePool: INodePool;
  provider: PropertiesOf<typeof Providers>;
}

const NodePoolScalingSpotInstancesDetails: React.FC<INodePoolScalingSpotInstancesDetailsProps> =
  ({ nodePool, provider }) => {
    const { node_spec } = nodePool;
    if (provider === Providers.AWS) {
      const instanceDistribution = node_spec?.aws?.instance_distribution;

      let baseCapacity = <NotAvailable />;
      let spotPercentage = <NotAvailable />;
      if (instanceDistribution) {
        baseCapacity = (
          <span>{String(instanceDistribution.on_demand_base_capacity)}</span>
        );
        spotPercentage = (
          <span>
            {String(
              /* eslint-disable-next-line no-magic-numbers */
              100 -
                instanceDistribution.on_demand_percentage_above_base_capacity
            )}
          </span>
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
      let headline = 'Spot virtual machines disabled';
      if (spotInstancesEnabled) {
        headline = 'Spot virtual machines enabled';
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

export default NodePoolScalingSpotInstancesDetails;
