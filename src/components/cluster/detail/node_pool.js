import { Code } from '../../../styles/';
import { css } from '@emotion/core';
import AvailabilityZonesLabel from 'UI/availability_zones_label';
import NodePoolDropdownMenu from './node_pool_dropdown_menu';
import PropTypes from 'prop-types';
import React from 'react';

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
    <React.Fragment>
      <Code>{id}</Code>
      <div>{name}</div>
      <Code>{instanceType}</Code>
      <div>
        <AvailabilityZonesLabel style={{ margin: '0.1vw' }} zones={avZones} />
      </div>
      <div>{min}</div>
      <div>{max}</div>
      <div>{desired}</div>
      <div>{current}</div>
      <NodePoolDropdownMenu />
    </React.Fragment>
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
