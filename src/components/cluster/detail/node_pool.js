import { Code } from '../../../styles/';
import NodePoolDropdownMenu from './node_pool_dropdown_menu';
import PropTypes from 'prop-types';
import React from 'react';

const NodePool = ({ nodePool }) => {
  const {
    id,
    name,
    instanceType,
    avZones,
    min,
    max,
    desired,
    current,
  } = nodePool;
  return (
    <React.Fragment>
      <Code>{id}</Code>
      <div>{name}</div>
      <Code>{instanceType}</Code>
      <div>
        <span>{avZones.a ? 'A' : null}</span>
        <span>{avZones.b ? 'B' : null}</span>
        <span>{avZones.c ? 'C' : null}</span>
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
    avZones: PropTypes.shape({
      a: PropTypes.bool,
      b: PropTypes.bool,
      c: PropTypes.bool,
    }),
    min: PropTypes.number,
    max: PropTypes.number,
    desired: PropTypes.number,
    current: PropTypes.number,
  }),
};

export default NodePool;
