import styled from '@emotion/styled';
import MasterNodesInfo from 'Cluster/ClusterDetail/MasterNodes/MasterNodesInfo';
import PropTypes from 'prop-types';
import React from 'react';
import { Constants } from 'shared/constants';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const TitleWrapper = styled.div`
  flex: 0 1 203px;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1 0 calc(100% - 203px);
`;

interface IMasterNodesProps extends React.ComponentPropsWithoutRef<'div'> {
  isHA?: boolean;
  availabilityZones?: string[];
  numOfReadyNodes?: number;
  numOfMaxHANodes?: number;
}

const MasterNodes: React.FC<IMasterNodesProps> = ({
  isHA,
  availabilityZones,
  numOfReadyNodes,
  numOfMaxHANodes,
  ...rest
}) => {
  const maxNumOfNodes: number = isHA ? (numOfMaxHANodes as number) : 1;

  return (
    <Wrapper {...rest}>
      <TitleWrapper>
        <span>Master nodes:</span>
      </TitleWrapper>
      <InfoWrapper>
        <MasterNodesInfo
          availabilityZones={availabilityZones}
          numOfReadyNodes={numOfReadyNodes}
          maxNumOfNodes={maxNumOfNodes}
        />
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
