import { Code, Dot, FlexRowWithTwoBlocksOnEdges, Row } from '../../../styles/';
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
  padding-top: 25px;
  border-top: 1px solid ${props => props.theme.colors.shade6};
  h2 {
    font-weight: 400;
    font-size: 22px;
    margin: 0;
  }
`;

const GridRowNodePoolsBase = css`
  ${Row};
  display: grid;
  grid-gap: 0 10px;
  grid-template-columns: 1fr 4fr 4fr 3fr repeat(4, 2fr) 1fr;
  justify-content: space-between;
  place-items: center center;
  > *:nth-child(2) {
    justify-self: left;
  }
  > *:nth-child(9) {
    justify-self: right;
  }
`;

const GridRowNodePoolsHeaders = styled.div`
  ${GridRowNodePoolsBase}
`;

const GridRowNodePoolsItem = styled.div`
  ${GridRowNodePoolsBase}
  background-color: ${props => props.theme.colors.shade7};
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
        <h2>Node Pools</h2>
        <GridRowNodePoolsHeaders>
          <span>ID</span>
          <span>NAME</span>
          <span>INSTANCE TYPE</span>
          <span>AV. ZONES</span>
          <span>MIN</span>
          <span>MAX</span>
          <span>DESIRED</span>
          <span>CURRENT</span>
          <span> </span>
        </GridRowNodePoolsHeaders>
        <GridRowNodePoolsItem>
          <Code>6dh</Code>
          <div>Database</div>
          <Code>r3.4xlarge</Code>
          <div>
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </div>
          <div>3</div>
          <div>3</div>
          <div>3</div>
          <div>3</div>
          <div>•••</div>
        </GridRowNodePoolsItem>
        <GridRowNodePoolsItem>
          <Code>z66</Code>
          <div>General purpose</div>
          <Code>m5.xlarge</Code>
          <div>
            <span></span>
            <span></span>
            <span>C</span>
          </div>
          <div>5</div>
          <div>20</div>
          <div>11</div>
          <div>12s</div>
          <div>•••</div>
        </GridRowNodePoolsItem>
      </NodePools>
    </React.Fragment>
  );
};

// NewClusterDetailTable.propTypes = {};

export default ClusterDetailTable;
