import { Code, FlexRowWithTwoBlocksOnEdges } from '../../../styles/';
import Button from '../../UI/button';
import React from 'react';
import styled from '@emotion/styled';
// import PropTypes from 'prop-types';

const Dot = styled.span`
  padding: 0 5px;
  &:before {
    content: '·';
  }
`;

const Upgrade = styled.div`
  color: #ce990f;
`;

const NodePools = styled.div`
  margin-top: 25px;
  border-top: 1px solid ${props => props.theme.colors.shade6};
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
        <FlexRowWithTwoBlocksOnEdges>ONE</FlexRowWithTwoBlocksOnEdges>
        <FlexRowWithTwoBlocksOnEdges>TWO</FlexRowWithTwoBlocksOnEdges>
      </NodePools>
    </React.Fragment>
  );
};

// NewClusterDetailTable.propTypes = {};

export default ClusterDetailTable;
