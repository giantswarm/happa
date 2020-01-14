import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { Code } from 'styles';
import theme from 'styles/theme';
import AvailabilityZonesLabels from 'UI/AvailabilityZonesLabels';
import Button from 'UI/Button';
import RefreshableLabel from 'UI/RefreshableLabel';

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
      // eslint-disable-next-line no-magic-numbers
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
        <div>VM size</div>
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
        )}{' '}
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
