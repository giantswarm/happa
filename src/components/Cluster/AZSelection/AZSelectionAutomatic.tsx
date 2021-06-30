import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import PropTypes from 'prop-types';
import * as React from 'react';

import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
  AZSelectionZonesUpdater,
  AZSelectorWrapper,
} from './AZSelectionUtils';

interface IAZSelectionAutomaticProps {
  onUpdateZones: AZSelectionZonesUpdater;
  variant: AZSelectionVariants;
  allZones: string[];
  minNumOfZones: number;
  maxNumOfZones: number;
  defaultNumOfZones: number;
  numOfZones: number;
}

const AZSelectionAutomatic: React.FC<IAZSelectionAutomaticProps> = ({
  onUpdateZones,
  variant,
  allZones,
  minNumOfZones,
  maxNumOfZones,
  defaultNumOfZones,
  numOfZones,
}) => {
  if (variant === AZSelectionVariants.Master) {
    return (
      <p>
        An Availabilty Zone will be automatically chosen from the existing ones.
      </p>
    );
  }

  let automaticAZSelectionMessage =
    'Availability zones will be selected randomly.';
  if (numOfZones < 2) {
    automaticAZSelectionMessage = `Covering one availability zone, the worker nodes of this node pool will be placed in the same availability zone as the cluster's control plane node.`;
  }

  return (
    <>
      <AZSelectorWrapper>
        <p>Number of availability zones to use:</p>
        <AvailabilityZonesParser
          min={minNumOfZones}
          max={maxNumOfZones}
          defaultValue={defaultNumOfZones}
          zones={allZones}
          updateAZValuesInParent={onUpdateZones(
            AvailabilityZoneSelection.Automatic
          )}
          isLabels={false}
        />
      </AZSelectorWrapper>
      <p>{automaticAZSelectionMessage}</p>
    </>
  );
};

AZSelectionAutomatic.propTypes = {
  onUpdateZones: PropTypes.func.isRequired,
  variant: PropTypes.number.isRequired,
  allZones: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  minNumOfZones: PropTypes.number.isRequired,
  maxNumOfZones: PropTypes.number.isRequired,
  defaultNumOfZones: PropTypes.number.isRequired,
  numOfZones: PropTypes.number.isRequired,
};

export default AZSelectionAutomatic;
