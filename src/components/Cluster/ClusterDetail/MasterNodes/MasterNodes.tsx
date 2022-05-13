import MasterNodeConverter from 'Cluster/ClusterDetail/MasterNodes/MasterNodesConverter';
import MasterNodesInfo from 'Cluster/ClusterDetail/MasterNodes/MasterNodesInfo';
import { Constants } from 'model/constants';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import ErrorReporter from 'utils/errors/ErrorReporter';

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

const MasterNodes: React.FC<React.PropsWithChildren<IMasterNodesProps>> = ({
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
  const azs: string[] = availabilityZones || [];

  const maxNumOfNodes: number = isHA ? (numOfMaxHANodes as number) : 1;

  const handleConvertToHA = async () => {
    setIsLoading(true);
    try {
      await onConvert?.();
      if (isMounted.current) {
        setIsConverting(false);
      }
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <Wrapper {...rest}>
      <TitleWrapper>
        <span>Control plane:</span>
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

MasterNodes.defaultProps = {
  isHA: false,
  canBeConverted: false,
  availabilityZones: [],
  supportsReadyNodes: false,
  numOfReadyNodes: null,
  numOfMaxHANodes: Constants.AWS_HA_MASTERS_MAX_NODES,
};

export default MasterNodes;
