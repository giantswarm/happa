import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import { useInstanceTypeSelectionLabels } from 'lib/hooks/useInstanceTypeSelectionConfiguration';
import React from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

type ChangeHandler = (machineType: string) => void;

interface IAddNodePoolMachineTypeProps
  extends Omit<React.ComponentPropsWithoutRef<typeof InputGroup>, 'onChange'> {
  machineType?: string;
  onChange?: ChangeHandler;
}

const AddNodePoolMachineType: React.FC<IAddNodePoolMachineTypeProps> = ({
  id,
  onChange,
  machineType,
  ...rest
}) => {
  const { singular: label } = useInstanceTypeSelectionLabels();

  return (
    <InputGroup {...rest} label={label}>
      <InstanceTypeSelector
        selectedInstanceType={machineType as string}
        selectInstanceType={onChange as ChangeHandler}
      />
    </InputGroup>
  );
};

AddNodePoolMachineType.defaultProps = {
  id: '',
  machineType: '',
  onChange: () => {},
};

export default AddNodePoolMachineType;
