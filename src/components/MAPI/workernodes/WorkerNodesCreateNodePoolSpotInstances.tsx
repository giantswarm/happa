import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import { Text } from 'grommet';
import { ProviderNodePool } from 'MAPI/types';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAzure,
} from 'MAPI/utils';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import React, { useState } from 'react';
import { Providers } from 'shared/constants';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import InputGroup from 'UI/Inputs/InputGroup';

import {
  INodePoolPropertyProps,
  NodePoolSpotInstancesConfig,
  withNodePoolSpotInstances,
} from './patches';
import WorkerNodesCreateNodePoolSpotInstancesAzure from './WorkerNodesCreateNodePoolSpotInstancesAzure';

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
    const featureEnabled = value?.enabled ?? false;

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

      if (provider === Providers.AZURE) {
        appendChanges({ enabled: e.target.checked, maxPrice: '' });
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
        {featureEnabled && provider === Providers.AZURE && (
          <WorkerNodesCreateNodePoolSpotInstancesAzure
            value={value as INodePoolSpotInstancesAzure}
            onChange={appendChanges}
            errorMessage={validationError}
          />
        )}
      </InputGroup>
    );
  };

export default WorkerNodesCreateNodePoolSpotInstances;
