import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import PropTypes from 'prop-types';
import * as React from 'react';

import {
  AvailabilityZoneSelection,
  AZSelectionZonesUpdater,
  AZSelectorWrapper,
} from './AZSelectionUtils';

interface AZSelectionAutomaticProps {
  onUpdateZones: AZSelectionZonesUpdater;
  allZones: string[];
  minNumOfZones: number;
  maxNumOfZones: number;
  defaultNumOfZones: number;
  numOfZones: number;
}

const AZSelectionAutomatic: React.FC<AZSelectionAutomaticProps> = ({
  onUpdateZones,
  allZones,
  minNumOfZones,
  maxNumOfZones,
  defaultNumOfZones,
  numOfZones,
}) => {
  let automaticAZSelectionMessage =
    'Availability zones will be selected randomly.';
  if (numOfZones < 2) {
    automaticAZSelectionMessage = `Covering one availability zone, the worker nodes of this node pool will be placed in the same availability zone as the cluster's master node.`;
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
  allZones: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  minNumOfZones: PropTypes.number.isRequired,
  maxNumOfZones: PropTypes.number.isRequired,
  defaultNumOfZones: PropTypes.number.isRequired,
  numOfZones: PropTypes.number.isRequired,
};

export default AZSelectionAutomatic;
