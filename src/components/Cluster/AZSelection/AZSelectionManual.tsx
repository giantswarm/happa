import styled from '@emotion/styled';
import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import PropTypes from 'prop-types';
import * as React from 'react';

import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
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
  variant: AZSelectionVariants;
  allZones: string[];
  minNumOfZones: number;
  maxNumOfZones: number;
  defaultNumOfZones: number;
  selectedZones: string[];
}

const AZSelectionManual: React.FC<AZSelectionManualProps> = ({
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
      <p>{descriptionMessage}</p>
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

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </AZSelectorWrapper>
    </>
  );
};

AZSelectionManual.propTypes = {
  onUpdateZones: PropTypes.func.isRequired,
  variant: PropTypes.number.isRequired,
  allZones: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  minNumOfZones: PropTypes.number.isRequired,
  maxNumOfZones: PropTypes.number.isRequired,
  selectedZones: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  defaultNumOfZones: PropTypes.number.isRequired,
};

export default AZSelectionManual;
