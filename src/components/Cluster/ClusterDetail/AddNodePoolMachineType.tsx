import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import PropTypes from 'prop-types';
import React from 'react';
import { Providers } from 'shared';
import { PropertiesOf } from 'shared/types';
import StyledInput from 'UI/ClusterCreation/StyledInput';

type ChangeHandler = (machineType: string) => void;

interface IAddNodePoolMachineTypeProps {
  provider?: PropertiesOf<typeof Providers>;
  id?: string;
  machineType?: string;
  onChange?: ChangeHandler;
}

const AddNodePoolMachineType: React.FC<IAddNodePoolMachineTypeProps> = ({
  id,
  onChange,
  machineType,
  provider,
}) => {
  const getInputID = React.useMemo(
    () => () => {
      switch (provider) {
        case Providers.AWS:
          return `instance-type-${id}`;
        case Providers.AZURE:
          return `vm-size-${id}`;
        default:
          return '';
      }
    },
    [id, provider]
  );

  const getLabel = React.useMemo(
    () => () => {
      switch (provider) {
        case Providers.AWS:
          return `Instance type`;
        case Providers.AZURE:
          return `VM size`;
        default:
          return '';
      }
    },
    [provider]
  );

  return (
    <StyledInput
      inputId={getInputID()}
      label={getLabel()}
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
  provider: PropTypes.oneOf(Object.values(Providers)),
  id: PropTypes.string,
  machineType: PropTypes.string,
  onChange: PropTypes.func,
};

AddNodePoolMachineType.defaultProps = {
  provider: Providers.AWS,
  id: '',
  machineType: '',
  onChange: () => {},
};

export default AddNodePoolMachineType;
