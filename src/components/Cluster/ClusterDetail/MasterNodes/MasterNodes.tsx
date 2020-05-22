import styled from '@emotion/styled';
import MasterNodeConverter from 'Cluster/ClusterDetail/MasterNodes/MasterNodesConverter';
import MasterNodesInfo from 'Cluster/ClusterDetail/MasterNodes/MasterNodesInfo';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Constants } from 'shared/constants';
import SlideTransition from 'styles/transitions/SlideTransition';

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
  const [isConverting, setIsConverting] = useState(false);

  const maxNumOfNodes: number = isHA ? (numOfMaxHANodes as number) : 1;

  return (
    <Wrapper {...rest}>
      <TitleWrapper>
        <span>Master nodes:</span>
      </TitleWrapper>
      <InfoWrapper>
        <SlideTransition
          in={isConverting}
          direction='up'
          timeout={{
            enter: 200,
            exit: 0,
          }}
        >
          <MasterNodeConverter onCancel={() => setIsConverting(false)} />
        </SlideTransition>
        <SlideTransition
          in={!isConverting}
          direction='up'
          timeout={{
            enter: 200,
            exit: 0,
          }}
        >
          <MasterNodesInfo
            isHA={isHA}
            availabilityZones={availabilityZones}
            numOfReadyNodes={numOfReadyNodes}
            maxNumOfNodes={maxNumOfNodes}
            onConvert={() => setIsConverting(true)}
          />
        </SlideTransition>
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
