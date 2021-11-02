import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import { getProviderNodePoolMachineTypes } from 'MAPI/utils';
import React from 'react';

import { INodePoolPropertyProps, withNodePoolMachineType } from './patches';

interface IWorkerNodesCreateNodePoolMachineTypeProps
  extends INodePoolPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof AddNodePoolMachineType>,
      'onChange' | 'id'
    > {}

const WorkerNodesCreateNodePoolMachineType: React.FC<IWorkerNodesCreateNodePoolMachineTypeProps> =
  ({
    id,
    providerNodePool,
    onChange,
    readOnly,
    disabled,
    autoFocus,
    ...props
  }) => {
    const handleChange = (newValue: string) => {
      onChange({
        isValid: true,
        patch: withNodePoolMachineType(newValue),
      });
    };

    const value =
      getProviderNodePoolMachineTypes(providerNodePool)?.primary ?? '';

    return (
      <AddNodePoolMachineType
        id={id}
        onChange={handleChange}
        machineType={value}
        {...props}
      />
    );
  };

export default WorkerNodesCreateNodePoolMachineType;
