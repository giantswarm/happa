import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import { Cluster } from 'MAPI/types';
import {
  getClusterReleaseVersion,
  getProviderNodePoolMachineTypes,
  INodePoolMachineTypesAWS,
} from 'MAPI/utils';
import { supportsAlikeInstances } from 'model/stores/nodepool/utils';
import React from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';

import {
  INodePoolPropertyProps,
  NodePoolMachineTypesConfig,
  withNodePoolMachineType,
} from './patches';

interface IWorkerNodesCreateNodePoolMachineTypeProps
  extends INodePoolPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof AddNodePoolMachineType>,
      'onChange' | 'id'
    > {
  cluster: Cluster;
}

const WorkerNodesCreateNodePoolMachineType: React.FC<
  React.PropsWithChildren<IWorkerNodesCreateNodePoolMachineTypeProps>
> = ({
  id,
  providerNodePool,
  onChange,
  readOnly,
  disabled,
  autoFocus,
  cluster,
  ...props
}) => {
  const machineTypes = getProviderNodePoolMachineTypes(providerNodePool);

  const appendChanges = (config: NodePoolMachineTypesConfig) => {
    onChange({
      isValid: true,
      patch: withNodePoolMachineType(config),
    });
  };

  const value = machineTypes?.primary ?? '';

  const provider = window.config.info.general.provider;

  const clusterReleaseVersion = getClusterReleaseVersion(cluster);
  const supportsAlikeInstanceTypes = clusterReleaseVersion
    ? supportsAlikeInstances(provider, clusterReleaseVersion)
    : false;
  const useAlikeInstanceTypes = (
    machineTypes as INodePoolMachineTypesAWS | undefined
  )?.similarInstances;

  const handleChangePrimaryType = (newValue: string) => {
    appendChanges({
      primary: newValue,
      similarInstances: useAlikeInstanceTypes,
    });
  };

  const handleChangeAlikeInstances = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    appendChanges({
      primary: value,
      similarInstances: e.target.checked,
    });
  };

  return (
    <>
      <AddNodePoolMachineType
        id={id}
        onChange={handleChangePrimaryType}
        machineType={value}
        {...props}
      />
      {supportsAlikeInstanceTypes && (
        <CheckBoxInput
          checked={useAlikeInstanceTypes}
          onChange={handleChangeAlikeInstances}
          label='Allow usage of similar instance types'
          formFieldProps={{ margin: { top: 'small' } }}
        />
      )}
    </>
  );
};

export default WorkerNodesCreateNodePoolMachineType;
