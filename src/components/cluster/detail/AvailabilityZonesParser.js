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
 * aggregates this data to a state object to be passed to the its parent component.
 *
 */

export default function AvailabilityZonesParser({
  max,
  min,
  updateAZValuesInParent,
  zones,
  isLabels,
  isRadioButtons, // Just one label can be selected.
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
    // If we want a radio button type behavior, we reset it on every click, else we add/remove it.
    const oldZonesArray = isRadioButtons ? [] : AZLabels.zonesArray;

    // If checked, we will add the new AZ to state, else we will remove it.
    const zonesArray = checked
      ? [...oldZonesArray, payload.title]
      : AZLabels.zonesArray.filter(az => az !== payload.title);

    setAZLabels({
      number: zonesArray.length,
      zonesString: zonesArray.map(zone => zone.slice(-1)).join(' '),
      zonesArray,
      valid: zonesArray.length > 0 && zonesArray.length <= max ? true : false, // Is this needed?
    });
  };

  if (isLabels) {
    return (
      <AvailabilityZonesLabels
        zones={zones}
        onToggleChecked={updateAZLabels}
        isRadioButtons={isRadioButtons}
        labelsChecked={AZLabels.zonesArray}
        isMaxReached={AZLabels.zonesArray.length === max}
      />
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

AvailabilityZonesParser.propTypes = {
  max: PropTypes.number,
  min: PropTypes.number,
  zones: PropTypes.array,
  value: PropTypes.number,
  updateAZValuesInParent: PropTypes.func,
  isLabels: PropTypes.bool,
  isRadioButtons: PropTypes.bool,
};
