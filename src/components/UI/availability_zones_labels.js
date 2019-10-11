import AvailabilityZonesLabel from 'UI/availability_zones_label';
import AvailabilityZonesLabelRadio from 'UI/AvailabilityZonesLabelRadio';
import PropTypes from 'prop-types';
import React from 'react';

// Returns an array of AvailabilityZonesLabel components
const AvailabilityZonesLabels = ({
  zones,
  onToggleChecked,
  labelsChecked,
  isV5Cluster,
}) => {
  if (typeof zones === 'undefined' || zones.length == 0) {
    return <abbr title='No information available'>n/a</abbr>;
  }

  return zones.map(az => {
    // we use the letter that is the last character as the label
    const letter = az.slice(-1);
    const label = letter.toUpperCase();

    if (isV5Cluster) {
      return (
        <AvailabilityZonesLabelRadio
          key={az}
          label={label}
          letter={letter}
          title={az}
          onToggleChecked={onToggleChecked}
          isChecked={labelsChecked.includes(az) ? true : false}
        />
      );
    }
    return (
      <AvailabilityZonesLabel
        key={az}
        label={label}
        letter={letter}
        title={az}
        onToggleChecked={onToggleChecked}
      />
    );
  });
};

AvailabilityZonesLabels.propTypes = {
  zones: PropTypes.PropTypes.arrayOf(PropTypes.string),
  onToggleChecked: PropTypes.func,
  isV5Cluster: PropTypes.bool,
  labelsChecked: PropTypes.array,
};

export default AvailabilityZonesLabels;
