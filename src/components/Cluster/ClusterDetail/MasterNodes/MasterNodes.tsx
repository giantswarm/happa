import styled from '@emotion/styled';
import { getAvailabilityZonesSectionLabel } from 'Cluster/ClusterDetail/MasterNodes/MasterNodesUtils';
import PropTypes from 'prop-types';
import React from 'react';
import { Constants } from 'shared/constants';
import AvailabilityZonesLabels from 'UI/AvailabilityZonesLabels';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const TitleWrapper = styled.div`
  flex: 0 1 203px;
`;

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

const InfoWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

interface IMasterNodesProps extends React.ComponentPropsWithoutRef<'div'> {
  isHA?: boolean;
  availabilityZones?: string[];
  numOfReadyNodes?: number;
  numOfMaxHANodes?: number;
}

const MasterNodes: React.FC<IMasterNodesProps> = ({
  availabilityZones,
  ...rest
}) => {
  const azLabel = getAvailabilityZonesSectionLabel(
    availabilityZones as string[]
  );

  return (
    <Wrapper {...rest}>
      <TitleWrapper>
        <span>Master nodes:</span>
      </TitleWrapper>
      <InfoWrapper>
        <Group>All 3 master nodes ready</Group>
        <Group>&#183;</Group>
        <AZGroup>
          <AZLabel>{azLabel}</AZLabel>
          <AvailabilityZonesLabels
            zones={availabilityZones}
            labelsChecked={[]}
          />
        </AZGroup>
      </InfoWrapper>
    </Wrapper>
  );
};

MasterNodes.propTypes = {
  isHA: PropTypes.bool,
  availabilityZones: PropTypes.arrayOf(PropTypes.string.isRequired),
  numOfReadyNodes: PropTypes.number,
  numOfMaxHANodes: PropTypes.number,
};

MasterNodes.defaultProps = {
  isHA: false,
  availabilityZones: [],
  numOfReadyNodes: 0,
  numOfMaxHANodes: Constants.AWS_HA_MASTERS_MAX_NODES,
};

export default MasterNodes;
