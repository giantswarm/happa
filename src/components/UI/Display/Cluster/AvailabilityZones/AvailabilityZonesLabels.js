import PropTypes from 'prop-types';
import React from 'react';
import AvailabilityZonesLabel from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabel';

// Returns an array of AvailabilityZonesLabel components
const AvailabilityZonesLabels = ({ zones, labelsChecked, ...props }) => {
  if (!zones || zones.length === 0) {
    return <abbr title='No information available'>n/a</abbr>;
  }

  return zones.map((az) => {
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
