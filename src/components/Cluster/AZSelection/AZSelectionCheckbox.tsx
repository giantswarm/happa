import PropTypes from 'prop-types';
import * as React from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
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
  npID?: string;
}

const AZSelectionCheckbox: React.FC<IAZSelectionCheckboxProps> = ({
  onChange,
  type,
  value,
  npID,
  ...rest
}) => {
  const typeName = AvailabilityZoneSelection[type as AvailabilityZoneSelection];
  const id = `np-${npID}-az-${typeName.toLowerCase()}`;

  return (
    <RUMActionTarget
      name={mergeActionNames(RUMActions.SelectAZSelection, typeName)}
    >
      <RadioInput
        id={id}
        checked={value === type}
        onChange={() => onChange(type as AvailabilityZoneSelection)}
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
  npID: PropTypes.string,
};

AZSelectionCheckbox.defaultProps = {
  type: AvailabilityZoneSelection.Automatic,
  value: AvailabilityZoneSelection.Automatic,
  npID: '',
};

export default AZSelectionCheckbox;
