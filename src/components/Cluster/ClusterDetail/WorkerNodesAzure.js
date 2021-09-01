import React from 'react';
import { FallbackMessages } from 'shared/constants';
import styled from 'styled-components';
import { FallbackSpan } from 'styles';
import Button from 'UI/Controls/Button';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import InstanceType from 'UI/Display/Cluster/InstanceType';
import NotAvailable from 'UI/Display/NotAvailable';
import RefreshableLabel from 'UI/Display/RefreshableLabel';

export const WrapperDiv = styled.div`
  font-size: 16px;
  font-weight: 400;
`;

export const LineDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 25px;

  div:first-of-type {
    width: 185px;
  }
`;

export const ScalingNodeCounter = styled(RefreshableLabel)`
  margin-right: 25px;
`;

function WorkerNodesAzure({
  az,
  isClusterCreating,
  instanceType,
  nodes,
  showScalingModal,
}) {
  const instanceTypeText = instanceType
    ? // prettier-ignore
      // eslint-disable-next-line no-magic-numbers
      `${instanceType.numberOfCores} CPUs, ${(instanceType.memoryInMb / 1000.0).toFixed(1)} GB RAM`
    : '0 CPUs, 0 GB RAM';

  const nodeCount = nodes || <NotAvailable />;

  return (
    <WrapperDiv>
      <LineDiv>
        <div>Availability zones</div>
        <div>
          <AvailabilityZonesLabels zones={az} />
        </div>
      </LineDiv>
      <LineDiv>
        <div>VM size</div>
        <InstanceType>{instanceType?.name ?? <NotAvailable />}</InstanceType>
        <RefreshableLabel value={instanceTypeText}>
          {instanceTypeText}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Nodes</div>
        <ScalingNodeCounter value={nodeCount}>
          {nodeCount === 0 && isClusterCreating ? (
            <FallbackSpan>{FallbackMessages.NODES_NOT_READY}</FallbackSpan>
          ) : (
            nodeCount
          )}
        </ScalingNodeCounter>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
    </WrapperDiv>
  );
}

export default WorkerNodesAzure;
