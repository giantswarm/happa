import React, { useEffect, useState } from 'react';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import NumberPicker from 'UI/Inputs/NumberPicker';

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
  defaultValue,
  updateAZValuesInParent,
  zones,
  isLabels,
  isRadioButtons, // If this is set to true, just one label can be selected.
}) {
  const initialStatePicker = {
    value: defaultValue,
    valid: true,
  };

  // Picker.
  const [AZPicker, setAZPicker] = useState(initialStatePicker);
  const [AZLabels, setAZLabels] = useState(initialStateLabels);

  useEffect(() => {
    if (isLabels) return;

    // Reset Labels
    // We could save state instead. I'm just doing this because it's easier.
    setAZLabels(initialStateLabels);
    updateAZValuesInParent(AZPicker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AZPicker]);

  // Labels.
  useEffect(() => {
    if (!isLabels) return;

    // Reset picker
    setAZPicker(initialStatePicker);
    updateAZValuesInParent(AZLabels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AZLabels]);

  // Function passed to child Number Picker component to allow it to update state here
  const updateAZPicker = (payload) => {
    setAZPicker(payload);
  };

  // Function passed to child AZLabels component to allow it to update state here
  const updateAZLabels = (checked, payload) => {
    // If we want a radio button type behavior, we reset it on every click, else we add/remove it.
    const oldZonesArray = isRadioButtons ? [] : AZLabels.zonesArray;

    // If checked, we will add the new AZ to state, else we will remove it.
    const zonesArray = checked
      ? [...oldZonesArray, payload.title]
      : AZLabels.zonesArray.filter((az) => az !== payload.title);

    setAZLabels({
      number: zonesArray.length,
      zonesString: zonesArray.map((zone) => zone.slice(-1)).join(' '),
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
      max={max}
      min={min}
      onChange={updateAZPicker}
      value={AZPicker.value}
      contentProps={{
        width: 'small',
      }}
    />
  );
}

AvailabilityZonesParser.defaultProps = {
  isRadioButtons: false,
};
