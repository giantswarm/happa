import Button from '../../UI/button';
import React from 'react';
import styled from '@emotion/styled';
// import PropTypes from 'prop-types';

const ClusterRowOnEdges = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.colors.shade7};
  padding: 0 21px 0 14px;
  height: 56px;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 0.3px;
  margin-bottom: 16px;
  > div:first-child {
    margin-right: auto;
    > * {
      margin-right: 18px;
      display: inline-block;
    }
  }
  > div:nth-child(2) {
    margin-left: auto;
  }
  i {
    padding: 0 2px;
  }
`;

const Code = styled.code`
  font-family: ${props => props.theme.fontFamilies.console};
  background-color: ${props => props.theme.colors.background};
  border-radius: 2px;
  padding: 0 5px;
  height: 30px;
  line-height: 30px;
  display: inline-block;
`;

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
      <ClusterRowOnEdges>
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
            <span>14 nodes in 2 node pools</span>
            <Dot />
            <span>105 GB RAM</span>
            <Dot />
            <span>30 CPUs</span>
        </div>
      </ClusterRowOnEdges>
      <ClusterRowOnEdges>
        <div>
            <span>Kubernetes endpoint URI:</span>
          <Code>https://api.a1b2c.k8s.gollum.westeurope.azure.gigantic.io</Code>
        </div>
        <div style={{ transform: 'translateX(10px)' }}>
        <Button>
                      <i className='fa fa-start' /> GET STARTED
                    </Button>
        </div>
      </ClusterRowOnEdges>
      <NodePools>
        <h3>Node Pools</h3>
        <ClusterRowOnEdges>ONE</ClusterRowOnEdges>
        <ClusterRowOnEdges>TWO</ClusterRowOnEdges>
      </NodePools>
    </React.Fragment>
  );
};

// NewClusterDetailTable.propTypes = {};

export default ClusterDetailTable;
