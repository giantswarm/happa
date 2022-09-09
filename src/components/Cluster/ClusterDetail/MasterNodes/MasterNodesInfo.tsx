import {
  getAvailabilityZonesSectionLabel,
  getReadinessLabel,
} from 'Cluster/ClusterDetail/MasterNodes/MasterNodesUtils';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';

const Group = styled.span`
  & + & {
    margin-left: 0.4rem;
  }
`;

const ConvertButton = styled(Button)`
  padding-top: 4px;
  padding-bottom: 4px;
  margin-left: 12px;
`;

const AZLabel = styled(Group)`
  margin-right: 0.4rem;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface IMasterNodesInfoProps extends React.ComponentPropsWithoutRef<'div'> {
  canBeConverted?: boolean;
  availabilityZones?: string[];
  numOfReadyNodes?: number | null;
  supportsReadyNodes?: boolean;
  maxNumOfNodes?: number;
  onConvert?: () => void;
}

const MasterNodesInfo: React.FC<
  React.PropsWithChildren<IMasterNodesInfoProps>
> = ({
  canBeConverted,
  availabilityZones,
  supportsReadyNodes,
  numOfReadyNodes,
  maxNumOfNodes,
  onConvert,
  ...rest
}) => {
  const azLabel = getAvailabilityZonesSectionLabel(
    availabilityZones as string[]
  );

  const readinessLabel = getReadinessLabel(
    numOfReadyNodes as number | null,
    maxNumOfNodes as number
  );

  const handleOnConvert = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onConvert?.();
  };

  return (
    <Wrapper {...rest}>
      {supportsReadyNodes && (
        <>
          <Group>{readinessLabel}</Group>
          <Group>&#183;</Group>
        </>
      )}

      <AZLabel>{azLabel}</AZLabel>
      <Group>
        <AvailabilityZonesLabels zones={availabilityZones} labelsChecked={[]} />
      </Group>

      {canBeConverted && (
        <Group>
          <ConvertButton onClick={handleOnConvert}>
            Switch to high availability…
          </ConvertButton>
        </Group>
      )}
    </Wrapper>
  );
};

MasterNodesInfo.defaultProps = {
  canBeConverted: false,
  availabilityZones: [],
  supportsReadyNodes: false,
  numOfReadyNodes: null,
  maxNumOfNodes: 0,
};

export default MasterNodesInfo;
