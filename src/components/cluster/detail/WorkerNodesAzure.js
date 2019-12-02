import { Code } from 'styles/index';
import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';
import RefreshableLabel from 'UI/RefreshableLabel';
import styled from '@emotion/styled';
import theme from 'styles/theme';

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

function WorkerNodesAzure({ az, instanceType, nodes, showScalingModal }) {
  const instanceTypeText = instanceType
    ? // prettier-ignore
      `${instanceType.numberOfCores} CPUs, ${(instanceType.memoryInMb / 1000.0).toFixed(1)} GB RAM`
    : '0 CPUs, 0 GB RAM';

  return (
    <WrapperDiv>
      <LineDiv>
        <div>Availability zones</div>
        <div>
          <AvailabilityZonesLabels zones={az} />
        </div>
      </LineDiv>
      <LineDiv>
        <div>Instance type</div>
        <Code style={{ background: theme.colors.shade7, marginRight: '10px' }}>
          {instanceType && instanceType.name}
        </Code>
        <RefreshableLabel value={instanceTypeText}>
          {instanceTypeText}
        </RefreshableLabel>
      </LineDiv>
      <LineDiv>
        <div>Nodes</div>
        {nodes && nodes !== 0 && (
          <RefreshableLabel value={nodes} style={{ marginRight: '25px' }}>
            {nodes}
          </RefreshableLabel>
        )}
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
    </WrapperDiv>
  );
}

WorkerNodesAzure.propTypes = {
  az: PropTypes.array,
  instanceType: PropTypes.object,
  nodes: PropTypes.number,
  showScalingModal: PropTypes.func,
};

export default WorkerNodesAzure;
