import AvailabilityZonesLabel from 'UI/availability_zones_label';
import React from 'react';

// Returns an array with the properties we need to build the view
export const availabilityZonesLabels = zones => {
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
