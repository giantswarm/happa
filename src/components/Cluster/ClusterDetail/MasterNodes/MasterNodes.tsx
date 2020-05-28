import styled from '@emotion/styled';
import MasterNodeConverter from 'Cluster/ClusterDetail/MasterNodes/MasterNodesConverter';
import MasterNodesInfo from 'Cluster/ClusterDetail/MasterNodes/MasterNodesInfo';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
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
  canBeConverted?: boolean;
  availabilityZones?: string[] | null;
  supportsReadyNodes?: boolean;
  numOfReadyNodes?: number | null;
  numOfMaxHANodes?: number;
  onConvert?: () => Promise<void>;
}

const MasterNodes: React.FC<IMasterNodesProps> = ({
  isHA,
  canBeConverted,
  availabilityZones,
  supportsReadyNodes,
  numOfReadyNodes,
  numOfMaxHANodes,
  onConvert,
  ...rest
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Account for nil slices in the server code.
  let azs: string[] = availabilityZones || [];
  if (azs.length > 0) {
    azs = azs.sort();
  }

  const maxNumOfNodes: number = isHA ? (numOfMaxHANodes as number) : 1;

  const handleConvertToHA = async () => {
    setIsLoading(true);
    try {
      await onConvert?.();
      if (isMounted.current) {
        setIsConverting(false);
      }
    } catch {
      // Skipping because we're handling the error in the action.
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
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
            canBeConverted={canBeConverted}
            availabilityZones={azs}
            supportsReadyNodes={supportsReadyNodes}
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
  canBeConverted: PropTypes.bool,
  availabilityZones: PropTypes.arrayOf(PropTypes.string.isRequired),
  supportsReadyNodes: PropTypes.bool,
  numOfReadyNodes: PropTypes.number,
  numOfMaxHANodes: PropTypes.number,
  onConvert: PropTypes.func,
};

MasterNodes.defaultProps = {
  isHA: false,
  canBeConverted: false,
  availabilityZones: [],
  supportsReadyNodes: false,
  numOfReadyNodes: null,
  numOfMaxHANodes: Constants.AWS_HA_MASTERS_MAX_NODES,
};

export default MasterNodes;
