import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import { ProviderNodePool } from 'MAPI/types';
import { getProviderNodePoolMachineType } from 'MAPI/utils';
import PropTypes from 'prop-types';
import React from 'react';

import { INodePoolPropertyProps, withNodePoolMachineType } from './patches';

interface IWorkerNodesCreateNodePoolMachineTypeProps
  extends INodePoolPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof AddNodePoolMachineType>,
      'onChange' | 'id'
    > {}

const WorkerNodesCreateNodePoolMachineType: React.FC<IWorkerNodesCreateNodePoolMachineTypeProps> = ({
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

  const value = getProviderNodePoolMachineType(providerNodePool);

  return (
    <AddNodePoolMachineType
      id={id}
      onChange={handleChange}
      machineType={value}
      {...props}
    />
  );
};

WorkerNodesCreateNodePoolMachineType.propTypes = {
  id: PropTypes.string.isRequired,
  providerNodePool: (PropTypes.object as PropTypes.Requireable<ProviderNodePool>)
    .isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export default WorkerNodesCreateNodePoolMachineType;
