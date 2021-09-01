import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import AddNodePoolSpotInstances from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolSpotInstances';
import { Text } from 'grommet';
import { ProviderNodePool } from 'MAPI/types';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAzure,
} from 'MAPI/utils';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import React, { useRef, useState } from 'react';
import { Constants } from 'shared/constants';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import InputGroup from 'UI/Inputs/InputGroup';

import {
  INodePoolPropertyProps,
  INodePoolSpotInstancesConfigAzure,
  NodePoolSpotInstancesConfig,
  withNodePoolSpotInstances,
} from './patches';

function getLabel(providerNodePool: ProviderNodePool): string {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return 'Spot virtual machines';
    default:
      return '';
  }
}

function getToggleLabel(providerNodePool: ProviderNodePool): string {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return 'Enabled';
    default:
      return '';
  }
}

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

interface IWorkerNodesCreateNodePoolSpotInstancesProps
  extends INodePoolPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof AddNodePoolMachineType>,
      'onChange' | 'id'
    > {}

const WorkerNodesCreateNodePoolSpotInstances: React.FC<IWorkerNodesCreateNodePoolSpotInstancesProps> = ({
  id,
  providerNodePool,
  onChange,
  readOnly,
  disabled,
  ...props
}) => {
  const value = getProviderNodePoolSpotInstances(providerNodePool);
  const useOnDemandPricing =
    typeof (value as INodePoolSpotInstancesAzure).maxPrice === 'number' &&
    (value as INodePoolSpotInstancesAzure).maxPrice < 0;

  const patchConfig = useRef<NodePoolSpotInstancesConfig>({
    enabled: value.enabled,
  });

  const [validationError, setValidationError] = useState('');

  const appendChanges = (
    config: NodePoolSpotInstancesConfig,
    errorMessage = ''
  ) => {
    onChange({
      isValid: errorMessage.length < 1,
      patch: withNodePoolSpotInstances(config),
    });
  };

  const handleToggleFeature = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError('');

    patchConfig.current.enabled = e.target.checked;

    appendChanges(patchConfig.current);
  };

  const handleSetMaxPrice = (newPrice: number) => {
    const validationResult = validateMaxPrice(newPrice);
    setValidationError(validationResult);

    (patchConfig.current as INodePoolSpotInstancesConfigAzure).maxPrice = newPrice.toString();

    appendChanges(patchConfig.current, validationResult);
  };

  const toggleOnDemandPricing = (enabled: boolean) => {
    setValidationError('');

    const nextPrice = enabled
      ? -1
      : Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MIN;

    (patchConfig.current as INodePoolSpotInstancesConfigAzure).maxPrice = nextPrice.toString();

    appendChanges(patchConfig.current);
  };

  const provider = window.config.info.general.provider;

  const formattedMaxPrice = formatMaxPrice(
    (value as INodePoolSpotInstancesAzure).maxPrice,
    useOnDemandPricing
  );

  return (
    <InputGroup htmlFor={id} label={getLabel(providerNodePool)} {...props}>
      <CheckBoxInput
        id={id}
        checked={value.enabled}
        onChange={handleToggleFeature}
        label={
          <Text weight='normal' color='text'>
            {getToggleLabel(providerNodePool)}
          </Text>
        }
      />
      {value.enabled && (
        <AddNodePoolSpotInstances
          provider={provider}
          spotPercentage={-1}
          setSpotPercentage={notImplementedCallback}
          onDemandBaseCapacity={-1}
          setOnDemandBaseCapacity={notImplementedCallback}
          maxPrice={formattedMaxPrice}
          setMaxPrice={handleSetMaxPrice}
          maxPriceValidationError={validationError}
          useOnDemandPricing={useOnDemandPricing}
          setUseOnDemandPricing={toggleOnDemandPricing}
        />
      )}
    </InputGroup>
  );
};

export default WorkerNodesCreateNodePoolSpotInstances;
