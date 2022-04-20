import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import { Text } from 'grommet';
import { ProviderNodePool } from 'MAPI/types';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAWS,
  INodePoolSpotInstancesAzure,
} from 'MAPI/utils';
import { Providers } from 'model/constants';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import React, { useState } from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import InputGroup from 'UI/Inputs/InputGroup';

import {
  INodePoolPropertyProps,
  NodePoolSpotInstancesConfig,
  withNodePoolSpotInstances,
} from './patches';
import WorkerNodesCreateNodePoolSpotInstancesAWS from './WorkerNodesCreateNodePoolSpotInstancesAWS';
import WorkerNodesCreateNodePoolSpotInstancesAzure from './WorkerNodesCreateNodePoolSpotInstancesAzure';

function getLabel(providerNodePool: ProviderNodePool): string {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return 'Spot virtual machines';
    case infrav1alpha3.AWSMachineDeployment:
      return 'Instance distribution';
    default:
      return '';
  }
}

function getToggleLabel(providerNodePool: ProviderNodePool): string {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return 'Enabled';
    case infrav1alpha3.AWSMachineDeployment:
      return 'Enable Spot instances';
    default:
      return '';
  }
}

interface IWorkerNodesCreateNodePoolSpotInstancesProps
  extends INodePoolPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof AddNodePoolMachineType>,
      'onChange' | 'id'
    > {}

const WorkerNodesCreateNodePoolSpotInstances: React.FC<
  React.PropsWithChildren<IWorkerNodesCreateNodePoolSpotInstancesProps>
> = ({ id, providerNodePool, onChange, readOnly, disabled, ...props }) => {
  const provider = window.config.info.general.provider;

  const value = getProviderNodePoolSpotInstances(providerNodePool);
  const [featureEnabled, setFeatureEnabled] = useState(value?.enabled ?? false);

  const [validationError, setValidationError] = useState('');

  const appendChanges = (
    config: NodePoolSpotInstancesConfig,
    errorMessage = ''
  ) => {
    setValidationError(errorMessage);

    onChange({
      isValid: errorMessage.length < 1,
      patch: withNodePoolSpotInstances(config),
    });
  };

  const handleToggleFeature = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError('');
    setFeatureEnabled(e.target.checked);

    switch (provider) {
      case Providers.AZURE:
        appendChanges({ enabled: e.target.checked, maxPrice: '' });
        break;
      case Providers.AWS:
        appendChanges({
          enabled: e.target.checked,
          onDemandBaseCapacity: 0,
          // eslint-disable-next-line no-magic-numbers
          onDemandPercentageAboveBaseCapacity: e.target.checked ? 0 : 100,
        });
        break;
    }
  };

  return (
    <InputGroup htmlFor={id} label={getLabel(providerNodePool)} {...props}>
      <CheckBoxInput
        id={id}
        checked={featureEnabled}
        onChange={handleToggleFeature}
        label={
          <Text weight='normal' color='text'>
            {getToggleLabel(providerNodePool)}
          </Text>
        }
      />

      {provider === Providers.AZURE && featureEnabled && (
        <WorkerNodesCreateNodePoolSpotInstancesAzure
          value={value as INodePoolSpotInstancesAzure}
          onChange={appendChanges}
          errorMessage={validationError}
        />
      )}

      {provider === Providers.AWS && featureEnabled && (
        <WorkerNodesCreateNodePoolSpotInstancesAWS
          value={value as INodePoolSpotInstancesAWS}
          onChange={appendChanges}
          errorMessage={validationError}
        />
      )}
    </InputGroup>
  );
};

export default WorkerNodesCreateNodePoolSpotInstances;
