import { Code } from 'styles/index';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import theme from 'styles/theme';

const WrapperDiv = styled.div`
  font-size: 16px;
  font-weight: 400;
`;

const LineDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 25px;
  div:first-of-type {
    width: 185px;
  }
`;

function WorkerNodesAzure({ instanceType, nodes, showScalingModal }) {
  return (
    <WrapperDiv>
      <LineDiv>
        <div>Instance type</div>
        <Code style={{ background: theme.colors.shade7, marginRight: '10px' }}>
          {instanceType && instanceType.name}
        </Code>
        <div>
          {instanceType && instanceType.numberOfCores} CPUs,{' '}
          {instanceType && (instanceType.memoryInMb / 1000.0).toFixed(1)} GB RAM
        </div>
      </LineDiv>
      <LineDiv>
        <div>Nodes</div>
        <div style={{ marginRight: '30px' }}>{nodes && nodes}</div>
        <Button onClick={showScalingModal}>Edit</Button>
      </LineDiv>
    </WrapperDiv>
  );
}

WorkerNodesAzure.propTypes = {
  instanceType: PropTypes.object,
  nodes: PropTypes.string,
  showScalingModal: PropTypes.func,
};

export default WorkerNodesAzure;
