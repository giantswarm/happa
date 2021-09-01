import React from 'react';
import AvailabilityZonesLabel from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabel';
import NotAvailable from 'UI/Display/NotAvailable';

// Returns an array of AvailabilityZonesLabel components
const AvailabilityZonesLabels = ({ zones, labelsChecked, ...props }) => {
  if (!zones || zones.length === 0) {
    return <NotAvailable />;
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

export default AvailabilityZonesLabels;
