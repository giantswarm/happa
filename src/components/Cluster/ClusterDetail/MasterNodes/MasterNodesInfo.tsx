import styled from '@emotion/styled';
import {
  getAvailabilityZonesSectionLabel,
  getReadinessLabel,
} from 'Cluster/ClusterDetail/MasterNodes/MasterNodesUtils';
import PropTypes from 'prop-types';
import React from 'react';
import AvailabilityZonesLabels from 'UI/AvailabilityZonesLabels';

const Group = styled.span`
  & + & {
    margin-left: 0.4rem;
  }
`;

const AZGroup = styled(Group)`
  margin-left: 0.4rem;
  flex-shrink: 0;
`;

const AZLabel = styled.span`
  margin-right: 0.8rem;
`;

interface IMasterNodesInfoProps {
  availabilityZones?: string[];
  numOfReadyNodes?: number;
  maxNumOfNodes?: number;
}

const MasterNodesInfo: React.FC<IMasterNodesInfoProps> = ({
  availabilityZones,
  maxNumOfNodes,
  numOfReadyNodes,
}) => {
  const azLabel = getAvailabilityZonesSectionLabel(
    availabilityZones as string[]
  );

  const readinessLabel = getReadinessLabel(
    numOfReadyNodes as number,
    maxNumOfNodes as number
  );

  return (
    <>
      <Group>{readinessLabel}</Group>
      <Group>&#183;</Group>
      <AZGroup>
        <AZLabel>{azLabel}</AZLabel>
        <AvailabilityZonesLabels zones={availabilityZones} labelsChecked={[]} />
      </AZGroup>
    </>
  );
};

MasterNodesInfo.propTypes = {
  availabilityZones: PropTypes.arrayOf(PropTypes.string.isRequired),
  numOfReadyNodes: PropTypes.number,
  maxNumOfNodes: PropTypes.number,
};

MasterNodesInfo.defaultProps = {
  availabilityZones: [],
  numOfReadyNodes: 0,
  maxNumOfNodes: 0,
};

export default MasterNodesInfo;
