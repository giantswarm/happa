import AvailabilityZonesLabel from 'UI/AvailabilityZonesLabel';
import PropTypes from 'prop-types';
import React from 'react';

// Returns an array of AvailabilityZonesLabel components
const AvailabilityZonesLabels = ({ zones, labelsChecked, ...props }) => {
  if (typeof zones === 'undefined' || zones.length == 0) {
    return <abbr title='No information available'>n/a</abbr>;
  }

  return zones.map(az => {
    // we use the letter that is the last character as the label
    const value = az.slice(-1);
    const label = value.toUpperCase();
    const isChecked = labelsChecked.includes(az);

    return (
      <AvailabilityZonesLabel
        key={az}
        label={label}
        value={value}
        title={az}
        isChecked={isChecked}
        {...props}
      />
    );
  });
};

AvailabilityZonesLabels.defaultProps = {
  zones: [],
  labelsChecked: [],
  isMaxReached: false,
  isRadioButtons: false,
};

AvailabilityZonesLabels.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.string),
  onToggleChecked: PropTypes.func,
  labelsChecked: PropTypes.array,
  isMaxReached: PropTypes.bool,
  isRadioButtons: PropTypes.bool,
};

export default AvailabilityZonesLabels;
