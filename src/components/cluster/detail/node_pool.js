import { Code } from 'styles/';
import AvailabilityZonesLabel from 'UI/availability_zones_label';
import NodePoolDropdownMenu from './node_pool_dropdown_menu';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import theme from 'styles/theme';

const NodesWrapper = styled.div`
  width: 36px;
  height: 30px;
  line-height: 31px;
  text-align: center;
  border-radius: 3px;
`;

const NodePool = ({ nodePool }) => {
  const {
    id,
    name,
    instanceType,
    min,
    max,
    avZones,
    desired,
    current,
  } = nodePool;

  return (
    <>
      <Code>{id}</Code>
      <div>{name}</div>
      <Code>{instanceType}</Code>
      <div>
        <AvailabilityZonesLabel style={{ margin: '0.1vw' }} zones={avZones} />
      </div>
      <NodesWrapper>{min}</NodesWrapper>
      <NodesWrapper>{max}</NodesWrapper>
      <NodesWrapper>{desired}</NodesWrapper>
      <NodesWrapper
        style={{
          background: current < desired ? theme.colors.goldBackground : null,
        }}
      >
        {current}
      </NodesWrapper>
      <NodePoolDropdownMenu />
    </>
  );
};

NodePool.propTypes = {
  nodePool: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    instanceType: PropTypes.string,
    avZones: PropTypes.array,
    min: PropTypes.number,
    max: PropTypes.number,
    desired: PropTypes.number,
    current: PropTypes.number,
  }),
};

export default NodePool;
