import { Code, Dot, FlexRowWithTwoBlocksOnEdges, Row } from '../../../styles/';
import { css } from '@emotion/core';
import Button from '../../UI/button';
// import NodePoolDropdownMenu from './node_pool_dropdown_menu';
import NodePool from './node_pool';
import React from 'react';
import styled from '@emotion/styled';

const Upgrade = styled.div`
  color: #ce990f;
`;

// Wrapper
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
  padding-right: 7px;
  > *:nth-child(2) {
    justify-self: left;
  }
  > *:nth-child(9) {
    justify-self: right;
  }
`;

const GridRowNodePoolsNodes = styled.div`
  ${GridRowNodePoolsBase};
  margin-bottom: 0;
  margin-top: -12px;
  min-height: 25px;
  color: ${props => props.theme.colors.gray};
  padding-top: 0;
  padding-bottom: 0;
  transform: translateY(12px);
  div {
    grid-column: 5 / span 4;
    font-size: 12px;
    position: relative;
    width: 100%;
    text-align: center;
    transform: translateX(0.8vw);
    span {
      display: inline-block;
      padding: 0 10px;
      background: ${props => props.theme.colors.shade2};
    }
    &::before {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 0;
      width: 100%;
      height: 4px;
      border: 1px solid ${props => props.theme.colors.gray};
      border-bottom: 0;
      z-index: -1;
    }
  }
`;

const GridRowNodePoolsHeaders = styled.div`
  ${GridRowNodePoolsBase};
  margin-bottom: 0;
`;

const GridRowNodePoolsItem = styled.div`
  ${GridRowNodePoolsBase};
  background-color: ${props => props.theme.colors.shade7};
`;

const nodePool1 = {
  id: '6dh',
  name: 'Database',
  instanceType: 'r3.4xlarge',
  avZones: { a: true, b: true, c: true },
  min: 3,
  max: 3,
  desired: 3,
  current: 3,
};

const nodePool2 = {
  id: 'z66',
  name: 'General Purpose',
  instanceType: 'm5.xlarge',
  avZones: { a: false, b: false, c: true },
  min: 5,
  max: 20,
  desired: 11,
  current: 12,
};

class ClusterDetailTable extends React.Component {
  render() {
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
            <Code>
              https://api.a1b2c.k8s.gollum.westeurope.azure.gigantic.io
            </Code>
          </div>
          <div style={{ transform: 'translateX(10px)' }}>
            <Button>
              <i className='fa fa-start' /> GET STARTED
            </Button>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
        <NodePools>
          <h2>Node Pools</h2>
          <GridRowNodePoolsNodes>
            <div>
              <span>NODES</span>
            </div>
          </GridRowNodePoolsNodes>
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
            <NodePool nodePool={nodePool1} />
          </GridRowNodePoolsItem>
          <GridRowNodePoolsItem>
            <NodePool nodePool={nodePool2} />
          </GridRowNodePoolsItem>
        </NodePools>
      </React.Fragment>
    );
  }
}

export default ClusterDetailTable;
