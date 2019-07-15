import { Code, Dot, FlexRowWithTwoBlocksOnEdges, Row } from '../../../styles/';
import { css } from '@emotion/core';
import Button from '../../UI/button';
import PopUpMenu from '../../UI/popUpMenu';
import React from 'react';
import styled from '@emotion/styled';
// import PropTypes from 'prop-types';

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
  ${GridRowNodePoolsBase}
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
  ${GridRowNodePoolsBase}
  margin-bottom: 0;
`;

const GridRowNodePoolsItem = styled.div`
  ${GridRowNodePoolsBase}
  background-color: ${props => props.theme.colors.shade7};
`;

class ClusterDetailTable extends React.Component {
  popUpMenu = () => (
    <PopUpMenu
      render={({ isOpen, onClickHandler, onFocusHandler, onBlurHandler }) => (
        <React.Fragment>
          <button
            aria-expanded={isOpen}
            aria-haspopup='true'
            onBlur={onBlurHandler}
            onClick={onClickHandler}
            onFocus={onFocusHandler}
            type='button'
          >
            •••
          </button>
          {isOpen && (
            <ul>
              <li>Rename</li>
              <li>Edit scaling limits</li>
              <li>Delete</li>
            </ul>
          )}
        </React.Fragment>
      )}
    />
  );

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
            {this.popUpMenu()}
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
            {this.popUpMenu()}
          </GridRowNodePoolsItem>
        </NodePools>
      </React.Fragment>
    );
  }
}

export default ClusterDetailTable;
