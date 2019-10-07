import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import NumberPicker from 'UI/number_picker';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const initialStatePicker = {
  value: 1,
  valid: true,
};

const initialStateLabels = {
  number: 0,
  zonesString: '',
  zonesArray: [],
  valid: false,
};

/**
 * This component takes values from AvailabilityZonesLabel via AvailabilityZonesLabels
 * and acts as a buffer so to speak. This is, it takes data from individual labels and
 * aggregates this data to a state object to be passed to the AddNodePool component.
 *
 */

export default function AddNodePoolsAvailabilityZones({
  max,
  min,
  updateAZValuesInParent,
  zones,
  isLabels,
}) {
  // Picker.
  const [AZPicker, setAZPicker] = useState(initialStatePicker);
  useEffect(() => {
    if (isLabels) return;

    // Reset Labels
    // We could save state instead. I'm just doing this because it's easier.
    setAZLabels(initialStateLabels);
    updateAZValuesInParent(AZPicker);
  }, [AZPicker]);

  // Labels.
  const [AZLabels, setAZLabels] = useState(initialStateLabels);
  useEffect(() => {
    if (!isLabels) return;

    // Reset picker
    setAZPicker(initialStatePicker);
    updateAZValuesInParent(AZLabels);
  }, [AZLabels]);

  // Function passed to child Number Picker component to allow it to update state here
  const updateAZPicker = payload => {
    setAZPicker(payload);
  };

  // Function passed to child AZLabels component to allow it to update state here
  const updateAZLabels = (checked, payload) => {
    // If checked, we will add the new AZ to state, else we will remove it.
    const zonesArray = checked
      ? [...AZLabels.zonesArray, payload.title]
      : AZLabels.zonesArray.filter(az => az !== payload.title);

    setAZLabels({
      number: zonesArray.length,
      zonesString: zonesArray.map(zone => zone.slice(-1)).join(' '),
      zonesArray,
      valid: zonesArray.length > 0 && zonesArray.length <= max ? true : false,
    });
  };

  if (isLabels) {
    return (
      <AvailabilityZonesLabels zones={zones} onToggleChecked={updateAZLabels} />
    );
  }

  return (
    <NumberPicker
      label=''
      max={max}
      min={min}
      onChange={updateAZPicker}
      readOnly={false}
      stepSize={1}
      value={AZPicker.value}
    />
  );
}

AddNodePoolsAvailabilityZones.propTypes = {
  max: PropTypes.number,
  min: PropTypes.number,
  zones: PropTypes.array,
  value: PropTypes.number,
  updateAZValuesInParent: PropTypes.func,
  isLabels: PropTypes.bool,
};
