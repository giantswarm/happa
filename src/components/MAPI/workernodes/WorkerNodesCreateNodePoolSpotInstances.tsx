import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import { Text } from 'grommet';
import { ProviderNodePool } from 'MAPI/types';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAWS,
  INodePoolSpotInstancesAzure,
} from 'MAPI/utils';
import React, { useState } from 'react';
import { Providers } from 'shared/constants';
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
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
      return 'Spot virtual machines';
    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return 'Instance distribution';
    default:
      return '';
  }
}

function getToggleLabel(providerNodePool: ProviderNodePool): string {
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
      return 'Enabled';
    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
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

const WorkerNodesCreateNodePoolSpotInstances: React.FC<IWorkerNodesCreateNodePoolSpotInstancesProps> =
  ({ id, providerNodePool, onChange, readOnly, disabled, ...props }) => {
    const provider = window.config.info.general.provider;

    const value = getProviderNodePoolSpotInstances(providerNodePool);
    const [featureEnabled, setFeatureEnabled] = useState(
      value?.enabled ?? false
    );

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
            onDemandPercentageAboveBaseCapacity: 0,
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
