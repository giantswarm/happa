import AddNodePoolSpotInstances from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolSpotInstances';
import { INodePoolSpotInstancesAzure } from 'MAPI/utils';
import React from 'react';
import { Constants, Providers } from 'shared/constants';

import { INodePoolSpotInstancesConfigAzure } from './patches';

function validateMaxPrice(maxPrice: number): string {
  if (maxPrice < Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MIN) {
    return `The value should be between ${Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MIN} and ${Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MAX}.`;
  }

  return '';
}

function formatMaxPrice(maxPrice: number, useOnDemandPricing: boolean): number {
  if (useOnDemandPricing && maxPrice < 0) return 0;

  return maxPrice;
}

const notImplementedCallback = () => {};

interface IWorkerNodesCreateNodePoolSpotInstancesAzureProps {
  value: INodePoolSpotInstancesAzure;
  onChange: (
    config: INodePoolSpotInstancesConfigAzure,
    errorMessage?: string
  ) => void;
  errorMessage?: string;
}

const WorkerNodesCreateNodePoolSpotInstancesAzure: React.FC<IWorkerNodesCreateNodePoolSpotInstancesAzureProps> =
  ({ value, onChange, errorMessage }) => {
    const useOnDemandPricing =
      typeof value.maxPrice === 'number' && value.maxPrice < 0;

    const toggleOnDemandPricing = (enabled: boolean) => {
      const nextPrice = enabled
        ? -1
        : Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MIN;

      onChange({ ...value, maxPrice: nextPrice.toString() });
    };

    const formattedMaxPrice = formatMaxPrice(
      value.maxPrice,
      useOnDemandPricing
    );

    const handleSetMaxPrice = (nextPrice: number) => {
      const validationResult = validateMaxPrice(nextPrice);

      onChange({ ...value, maxPrice: nextPrice.toString() }, validationResult);
    };

    return (
      <AddNodePoolSpotInstances
        provider={Providers.AZURE}
        spotPercentage={-1}
        setSpotPercentage={notImplementedCallback}
        onDemandBaseCapacity={-1}
        setOnDemandBaseCapacity={notImplementedCallback}
        maxPrice={formattedMaxPrice}
        setMaxPrice={handleSetMaxPrice}
        maxPriceValidationError={errorMessage!}
        useOnDemandPricing={useOnDemandPricing}
        setUseOnDemandPricing={toggleOnDemandPricing}
      />
    );
  };

WorkerNodesCreateNodePoolSpotInstancesAzure.defaultProps = {
  errorMessage: '',
};

export default WorkerNodesCreateNodePoolSpotInstancesAzure;
