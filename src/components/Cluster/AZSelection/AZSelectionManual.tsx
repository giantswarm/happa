import styled from '@emotion/styled';
import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import PropTypes from 'prop-types';
import * as React from 'react';

import {
  AvailabilityZoneSelection,
  AZSelectionZonesUpdater,
  AZSelectorWrapper,
} from './AZSelectionUtils';

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 400;
  margin-bottom: 0;
`;

const ManualAZSelector = styled.div`
  font-size: 16px;
`;

interface AZSelectionManualProps {
  onUpdateZones: AZSelectionZonesUpdater;
  allZones: string[];
  minNumOfZones: number;
  maxNumOfZones: number;
  defaultNumOfZones: number;
  selectedZones: string[];
}

const AZSelectionManual: React.FC<AZSelectionManualProps> = ({
  onUpdateZones,
  allZones,
  minNumOfZones,
  maxNumOfZones,
  defaultNumOfZones,
  selectedZones,
}) => {
  let manualAZSelectionErrorMessage = '';
  if (selectedZones.length < 1) {
    manualAZSelectionErrorMessage = 'Please select at least one.';
  } else if (selectedZones.length > maxNumOfZones) {
    const zoneCountDiff = selectedZones.length - maxNumOfZones;
    manualAZSelectionErrorMessage = `${maxNumOfZones} is the maximum you can have. Please uncheck at least ${zoneCountDiff} of them.`;
  }

  return (
    <>
      <p>
        You can select up to {maxNumOfZones} availability zones to make use of.
      </p>
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
          />
        </ManualAZSelector>

        {manualAZSelectionErrorMessage && (
          <ErrorMessage>{manualAZSelectionErrorMessage}</ErrorMessage>
        )}
      </AZSelectorWrapper>
    </>
  );
};

AZSelectionManual.propTypes = {
  onUpdateZones: PropTypes.func.isRequired,
  allZones: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  minNumOfZones: PropTypes.number.isRequired,
  maxNumOfZones: PropTypes.number.isRequired,
  selectedZones: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  defaultNumOfZones: PropTypes.number.isRequired,
};

export default AZSelectionManual;
