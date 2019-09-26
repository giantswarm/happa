import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import NumberPicker from 'UI/number_picker';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

export default function AddNodePoolsAvailabilityZones({
  max,
  min,
  value,
  onChange,
}) {
  const [toggle, setToggle] = useState(true);

  const doToggle = () => setToggle(toggle => !toggle);

  if (toggle) {
    return (
      <>
        <NumberPicker
          label=''
          max={max}
          min={min}
          onChange={onChange}
          readOnly={false}
          stepSize={1}
          value={value}
        />
        <p>
          or{' '}
          <span onClick={doToggle} alt='Select distinct availability zones'>
            Select distinct availability zones SS
          </span>
        </p>
      </>
    );
  }

  return (
    <div>
      <AvailabilityZonesLabels
        zones={[
          'europe-west-1a',
          'europe-west-1b',
          'europe-west-1c',
          'europe-west-1d',
        ]}
      />
    </div>
  );
}

AddNodePoolsAvailabilityZones.propTypes = {
  max: PropTypes.number,
  min: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func,
};
