import { Box } from 'grommet';
import React from 'react';
import AvailabilityZonesLabel, {
  AvailabilityZonesLabelVariant,
} from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabel';
import NotAvailable from 'UI/Display/NotAvailable';

interface IAvailabilityZonesLabelsProps {
  labelsChecked: string[];
  zones?: string[];
  isMaxReached?: boolean;
  isRadioButtons?: boolean;
  variant?: AvailabilityZonesLabelVariant;
}

// Returns an array of AvailabilityZonesLabel components
const AvailabilityZonesLabels: React.FC<IAvailabilityZonesLabelsProps> = ({
  zones,
  labelsChecked,
  variant,
  ...props
}) => {
  if (!zones || zones.length === 0) {
    return <NotAvailable />;
  }

  return (
    <Box gap='xsmall' direction='row'>
      {zones.map((az, i) => {
        const value = az.slice(-1);
        const label = value.toUpperCase();
        const isChecked = labelsChecked.includes(az);

        return (
          <AvailabilityZonesLabel
            key={`${az}-${i}`}
            label={label}
            value={value}
            title={az}
            isChecked={isChecked}
            variant={variant}
            {...props}
          />
        );
      })}
    </Box>
  );
};

AvailabilityZonesLabels.defaultProps = {
  zones: [],
  labelsChecked: [],
  isMaxReached: false,
  isRadioButtons: false,
  variant: AvailabilityZonesLabelVariant.AvailabilityZone,
};

export default AvailabilityZonesLabels;
