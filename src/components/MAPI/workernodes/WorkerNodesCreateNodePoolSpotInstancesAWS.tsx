import AddNodePoolSpotInstances from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolSpotInstances';
import { INodePoolSpotInstancesAWS } from 'MAPI/utils';
import { Providers } from 'model/constants';
import React from 'react';

import { INodePoolSpotInstancesConfigAWS } from './patches';

const notImplementedCallback = () => {};

interface IWorkerNodesCreateNodePoolSpotInstancesAWSProps {
  value: INodePoolSpotInstancesAWS;
  onChange: (
    config: INodePoolSpotInstancesConfigAWS,
    errorMessage?: string
  ) => void;
  errorMessage?: string;
}

const WorkerNodesCreateNodePoolSpotInstancesAWS: React.FC<
  IWorkerNodesCreateNodePoolSpotInstancesAWSProps
> = ({ value, onChange }) => {
  // eslint-disable-next-line no-magic-numbers
  const spotPercentage = 100 - value.onDemandPercentageAboveBaseCapacity;

  const handleSetSpotPercentage: React.ComponentPropsWithoutRef<
    typeof AddNodePoolSpotInstances
  >['setSpotPercentage'] = ({ value: spotInstancePercentage, valid }) => {
    let validationMessage = '';
    if (!valid) {
      validationMessage = 'The spot instances percentage is invalid.';
    }

    onChange(
      {
        ...value,
        // eslint-disable-next-line no-magic-numbers
        onDemandPercentageAboveBaseCapacity: 100 - spotInstancePercentage,
      },
      validationMessage
    );
  };

  const handleSetOnDemandBaseCapacity: React.ComponentPropsWithoutRef<
    typeof AddNodePoolSpotInstances
  >['setOnDemandBaseCapacity'] = ({ value: onDemandBaseCapacity, valid }) => {
    let validationMessage = '';
    if (!valid) {
      validationMessage = 'The spot instances percentage is invalid.';
    }

    onChange(
      {
        ...value,
        onDemandBaseCapacity,
      },
      validationMessage
    );
  };

  return (
    <AddNodePoolSpotInstances
      provider={Providers.AWS}
      spotPercentage={spotPercentage}
      setSpotPercentage={handleSetSpotPercentage}
      onDemandBaseCapacity={value.onDemandBaseCapacity}
      setOnDemandBaseCapacity={handleSetOnDemandBaseCapacity}
      maxPrice={-1}
      setMaxPrice={notImplementedCallback}
      maxPriceValidationError=''
      useOnDemandPricing={false}
      setUseOnDemandPricing={notImplementedCallback}
    />
  );
};

WorkerNodesCreateNodePoolSpotInstancesAWS.defaultProps = {
  errorMessage: '',
};

export default WorkerNodesCreateNodePoolSpotInstancesAWS;
