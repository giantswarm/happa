import { Code } from 'styles/index';
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

function WorkerNodesAzure({ instanceType, nodes, showScalingModal }) {
  const instanceTypeText = instanceType
    ? `${instanceType.cpu_cores} CPUs, ${instanceType.memory_size_gb.toFixed(
        0
      )} GB RAM`
    : '0 CPUs, 0 GB RAM';

  return (
    <WrapperDiv>
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
        {nodes && (
          <RefreshableLabel value={nodes} style={{ marginRight: '30px' }}>
            {nodes}
          </RefreshableLabel>
        )}
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
    </WrapperDiv>
  );
}

WorkerNodesAzure.propTypes = {
  instanceType: PropTypes.object,
  nodes: PropTypes.number,
  showScalingModal: PropTypes.func,
};

export default WorkerNodesAzure;
