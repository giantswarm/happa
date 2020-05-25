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
  min-width: 300px;
  max-width: 100%;
`;

interface IMasterNodesProps extends React.ComponentPropsWithoutRef<'div'> {
  isHA?: boolean;
  availabilityZones?: string[] | null;
  numOfReadyNodes?: number | null;
  numOfMaxHANodes?: number;
  onConvert?: () => Promise<void>;
}

const MasterNodes: React.FC<IMasterNodesProps> = ({
  isHA,
  availabilityZones,
  numOfReadyNodes,
  numOfMaxHANodes,
  onConvert,
  ...rest
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Account for nil slices in the server code.
  const azs: string[] = availabilityZones || [];

  const maxNumOfNodes: number = isHA ? (numOfMaxHANodes as number) : 1;

  const handleConvertToHA = async () => {
    setIsLoading(true);
    try {
      await onConvert?.();
      setIsConverting(false);
      // eslint-disable-next-line no-empty
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

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
          <MasterNodeConverter
            onApply={handleConvertToHA}
            onCancel={() => setIsConverting(false)}
            isLoading={isLoading}
          />
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
            availabilityZones={azs}
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
  onConvert: PropTypes.func,
};

MasterNodes.defaultProps = {
  isHA: false,
  availabilityZones: [],
  numOfReadyNodes: null,
  numOfMaxHANodes: Constants.AWS_HA_MASTERS_MAX_NODES,
};

export default MasterNodes;
