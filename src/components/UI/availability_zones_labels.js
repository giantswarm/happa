import AvailabilityZonesLabel from 'UI/availability_zones_label';
import PropTypes from 'prop-types';
import React from 'react';

// Returns an array of AvailabilityZonesLabel components
const AvailabilityZonesLabels = ({ zones }) => {
  if (typeof zones === 'undefined' || zones.length == 0) {
    return <abbr title='No information available'>n/a</abbr>;
  }

  return zones.map(az => {
    // we use the letter that is the last character as the label
    const letter = az.slice(-1);
    const label = letter.toUpperCase();

    return (
      <AvailabilityZonesLabel
        key={az}
        label={label}
        letter={letter}
        title={az}
      />
    );
  });
};

AvailabilityZonesLabels.propTypes = {
  zones: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      letter: PropTypes.string,
      title: PropTypes.string,
    })
  ),
};

export default AvailabilityZonesLabels;
