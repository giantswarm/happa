import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import { useInstanceTypeSelectionLabels } from 'hooks/useInstanceTypeSelectionConfiguration';
import PropTypes from 'prop-types';
import React from 'react';
import StyledInput from 'UI/ClusterCreation/StyledInput';

type ChangeHandler = (machineType: string) => void;

interface IAddNodePoolMachineTypeProps
  extends React.ComponentPropsWithoutRef<typeof StyledInput> {
  id?: string;
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
    <StyledInput
      {...rest}
      inputId={`machine-type-${id as string}`}
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
