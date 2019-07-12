import { Code, Dot, FlexRowBase, FlexRowWithTwoBlocksOnEdges } from '../../../styles/';
import { css } from '@emotion/core';
import Button from '../../UI/button';
import React from 'react';
import styled from '@emotion/styled';
// import PropTypes from 'prop-types';

const Upgrade = styled.div`
  color: #ce990f;
`;

const NodePools = styled.div`
  margin-top: 25px;
  border-top: 1px solid ${props => props.theme.colors.shade6};
`;

const FlexRowNodePools = styled.div`
  ${FlexRowBase};
`;

const FlexRowNodePoolsBase = css`
  ${FlexRowBase};
  /* Default for all spans */
  span { flex-grow: 1 }
  /* Custom */
  span:first-of-type { width: 20px }
  span:nth-of-type(2) { flex-grow: 5 }
  span:nth-of-type(3) { flex-grow: 5 }
  span:nth-of-type(4) { width: 87px}
  span:nth-of-type(5) { min-width: 60px }
  span:nth-of-type(6) { min-width: 60px }
  span:nth-of-type(7) { min-width: 60px }
  span:nth-of-type(8) { margin-right: 70px}
`;

const FlexRowHeaders = styled.div`
  ${FlexRowNodePoolsBase}
`;

const ClusterDetailTable = () => {
  return (
    <React.Fragment>
      <FlexRowWithTwoBlocksOnEdges>
        <div>
          <Code>europe-central-1</Code>
          <div>
            <span>Created 1 month ago</span>
            <Dot />
            <i className='fa fa-version-tag' />
            <span>6.3.2</span>
            <Dot />
            <i className='fa fa-kubernetes' />
            <span>1.13.3</span>
          </div>
          <Upgrade>
            <i className='fa fa-warning' />
            <span>Upgrade available</span>
          </Upgrade>
        </div>
        <div>
          <div>
            <span>14 nodes in 2 node pools</span>
            <Dot />
            <span>105 GB RAM</span>
            <Dot />
            <span>30 CPUs</span>
          </div>
        </div>
      </FlexRowWithTwoBlocksOnEdges>
      <FlexRowWithTwoBlocksOnEdges>
        <div>
            <span>Kubernetes endpoint URI:</span>
          <Code>https://api.a1b2c.k8s.gollum.westeurope.azure.gigantic.io</Code>
        </div>
        <div style={{ transform: 'translateX(10px)' }}>
        <Button>
                      <i className='fa fa-start' /> GET STARTED
                    </Button>
        </div>
      </FlexRowWithTwoBlocksOnEdges>
      <NodePools>
        <h3>Node Pools</h3>
        <FlexRowHeaders>
          <span>ID</span>
          <span>NAME</span>
          <span>INSTANCE TYPE</span>
          <span>AV. ZONES</span>
          <span>MIN</span>
          <span>MAX</span>
          <span>DESIRED</span>
          <span>CURRENT</span>
        </FlexRowHeaders>
        <FlexRowNodePools >ONE</FlexRowNodePools >
        <FlexRowNodePools >TWO</FlexRowNodePools >
      </NodePools>
    </React.Fragment>
  );
};

// NewClusterDetailTable.propTypes = {};

export default ClusterDetailTable;
