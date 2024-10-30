import { Text } from 'grommet';
import * as React from 'react';
import RadioInput from 'UI/Inputs/RadioInput';

import { AvailabilityZoneSelection } from './AZSelectionUtils';

interface IAZSelectionCheckboxProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioInput>,
    'onChange' | 'value' | 'id' | 'type' | 'name'
  > {
  onChange: (newAZSelection: AvailabilityZoneSelection) => void;
  type?: AvailabilityZoneSelection;
  value?: AvailabilityZoneSelection;
  uniqueIdentifier?: string;
  baseActionName?: string;
  label?: string;
}

const AZSelectionCheckbox: React.FC<
  React.PropsWithChildren<IAZSelectionCheckboxProps>
> = ({
  onChange,
  type,
  value,
  uniqueIdentifier,
  baseActionName,
  label,
  ...rest
}) => {
  const typeName = AvailabilityZoneSelection[type as AvailabilityZoneSelection];
  const id = `${uniqueIdentifier}-${typeName.toLowerCase()}`;

  return (
    <RadioInput
      id={id}
      name={id}
      checked={value === type}
      onChange={() => onChange(type!)}
      tabIndex={-1}
      label={
        <Text weight='normal' color='text'>
          {label}
        </Text>
      }
      {...rest}
    />
  );
};

AZSelectionCheckbox.defaultProps = {
  type: AvailabilityZoneSelection.Automatic,
  value: AvailabilityZoneSelection.Automatic,
  uniqueIdentifier: '',
  baseActionName: '',
};

export default AZSelectionCheckbox;
