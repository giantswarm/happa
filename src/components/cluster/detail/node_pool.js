import { Code } from 'styles/';
import AvailabilityZonesWrapper from './availability_zones_wrapper';
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

const NodePool = ({ availableZonesGridTemplateAreas, nodePool }) => {
  const { id, name, scaling, availability_zones, status, node_spec } = nodePool;

  const { nodes_ready: desired, nodes: current } = status;

  return (
    <>
      <Code>{id}</Code>
      <div style={{ paddingLeft: '8px' }}>{name}</div>
      <Code>{node_spec.aws.instance_type}</Code>
      <div>
        <AvailabilityZonesWrapper
          availableZonesGridTemplateAreas={availableZonesGridTemplateAreas}
          zones={availability_zones}
        />
      </div>
      <NodesWrapper>{scaling.Min}</NodesWrapper>
      <NodesWrapper>{scaling.Max}</NodesWrapper>
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
  availableZonesGridTemplateAreas: PropTypes.string,
  nodePool: PropTypes.shape({
    availability_zones: PropTypes.array,
    id: PropTypes.string,
    name: PropTypes.string,
    node_spec: PropTypes.object,
    scaling: PropTypes.shape({
      Min: PropTypes.number,
      Max: PropTypes.number,
    }),
    status: PropTypes.shape({
      nodes: PropTypes.number,
      nodes_ready: PropTypes.number,
    }),
  }),
};

export default NodePool;
