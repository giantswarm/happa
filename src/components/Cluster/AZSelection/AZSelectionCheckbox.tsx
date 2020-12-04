import PropTypes from 'prop-types';
import * as React from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import RadioInput from 'UI/Inputs/RadioInput';
import { mergeActionNames } from 'utils/realUserMonitoringUtils';

import { AvailabilityZoneSelection } from './AZSelectionUtils';

interface IAZSelectionCheckboxProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioInput>,
    'onChange' | 'value' | 'id'
  > {
  onChange: (newAZSelection: AvailabilityZoneSelection) => void;
  type?: AvailabilityZoneSelection;
  value?: AvailabilityZoneSelection;
  uniqueIdentifier?: string;
  baseActionName?: string;
}

const AZSelectionCheckbox: React.FC<IAZSelectionCheckboxProps> = ({
  onChange,
  type,
  value,
  uniqueIdentifier,
  baseActionName,
  ...rest
}) => {
  const typeName = AvailabilityZoneSelection[type as AvailabilityZoneSelection];
  const id = `${uniqueIdentifier}-${typeName.toLowerCase()}`;

  return (
    <RUMActionTarget name={mergeActionNames(baseActionName!, typeName)}>
      <RadioInput
        id={id}
        checked={value === type}
        onChange={() => onChange(type!)}
        tabIndex={0}
        {...rest}
      />
    </RUMActionTarget>
  );
};

AZSelectionCheckbox.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
  type: PropTypes.number,
  uniqueIdentifier: PropTypes.string,
  baseActionName: PropTypes.string,
};

AZSelectionCheckbox.defaultProps = {
  type: AvailabilityZoneSelection.Automatic,
  value: AvailabilityZoneSelection.Automatic,
  uniqueIdentifier: '',
  baseActionName: '',
};

export default AZSelectionCheckbox;
