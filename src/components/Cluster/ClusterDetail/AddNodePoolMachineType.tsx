import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import { useInstanceTypeSelectionLabels } from 'hooks/useInstanceTypeSelectionConfiguration';
import PropTypes from 'prop-types';
import React from 'react';
import StyledInput from 'UI/ClusterCreation/StyledInput';

type ChangeHandler = (machineType: string) => void;

interface IAddNodePoolMachineTypeProps {
  id?: string;
  machineType?: string;
  onChange?: ChangeHandler;
}

const AddNodePoolMachineType: React.FC<IAddNodePoolMachineTypeProps> = ({
  id,
  onChange,
  machineType,
}) => {
  const { singular: label } = useInstanceTypeSelectionLabels();

  return (
    <StyledInput
      inputId={`machine-type-${id}`}
      label={label}
      // regular space, hides hint ;)
      hint={<>&#32;</>}
    >
      <InstanceTypeSelector
        selectedInstanceType={machineType as string}
        selectInstanceType={onChange as ChangeHandler}
      />
    </StyledInput>
  );
};

AddNodePoolMachineType.propTypes = {
  id: PropTypes.string,
  machineType: PropTypes.string,
  onChange: PropTypes.func,
};

AddNodePoolMachineType.defaultProps = {
  id: '',
  machineType: '',
  onChange: () => {},
};

export default AddNodePoolMachineType;
