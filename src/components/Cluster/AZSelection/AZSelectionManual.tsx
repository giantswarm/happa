import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import { Box, Text } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';

import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
  AZSelectionZonesUpdater,
  AZSelectorWrapper,
} from './AZSelectionUtils';

const ManualAZSelector = styled.div`
  font-size: 16px;
`;

interface IAZSelectionManualProps {
  onUpdateZones: AZSelectionZonesUpdater;
  variant: AZSelectionVariants;
  allZones: string[];
  minNumOfZones: number;
  maxNumOfZones: number;
  defaultNumOfZones: number;
  selectedZones: string[];
}

const AZSelectionManual: React.FC<IAZSelectionManualProps> = ({
  onUpdateZones,
  variant,
  allZones,
  minNumOfZones,
  maxNumOfZones,
  defaultNumOfZones,
  selectedZones,
}) => {
  let descriptionMessage = 'Please select an availability zone.';
  if (variant === AZSelectionVariants.NodePool) {
    descriptionMessage = `You can select up to ${maxNumOfZones} availability zones to make use of.`;
  }

  let errorMessage = '';
  if (selectedZones.length < 1) {
    errorMessage = 'Please select one.';
    if (variant === AZSelectionVariants.NodePool) {
      errorMessage = 'Please select at least one.';
    }
  } else if (selectedZones.length > maxNumOfZones) {
    const zoneCountDiff = selectedZones.length - maxNumOfZones;
    errorMessage = `${maxNumOfZones} is the maximum you can have. Please uncheck at least ${zoneCountDiff} of them.`;
  }

  return (
    <>
      <Box margin={{ bottom: 'small' }}>
        <Text>{descriptionMessage}</Text>
      </Box>
      <AZSelectorWrapper>
        <ManualAZSelector>
          <AvailabilityZonesParser
            min={minNumOfZones}
            max={maxNumOfZones}
            defaultValue={defaultNumOfZones}
            zones={allZones}
            updateAZValuesInParent={onUpdateZones(
              AvailabilityZoneSelection.Manual
            )}
            isLabels={true}
            isRadioButtons={variant === AZSelectionVariants.Master}
          />
        </ManualAZSelector>

        {errorMessage && <Text color='status-critical'>{errorMessage}</Text>}
      </AZSelectorWrapper>
    </>
  );
};

export default AZSelectionManual;
