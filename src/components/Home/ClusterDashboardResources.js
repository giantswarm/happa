import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  selectComputedResourcesV4,
  selectComputedResourcesV5,
} from 'selectors/index';
import { Dot } from 'styles';
import RefreshableLabel from 'UI/RefreshableLabel';

const ClusterDetailsDiv = styled.div`
  height: 27px;
  img {
    height: 22px;
  }
`;

function ClusterDashboardResources({ cluster, resources }) {
  const { memory, storage, cores, numberOfNodes } = resources;
  const hasNodePools = cluster.nodePools && cluster.nodePools.length !== 0;

  return (
    <ClusterDetailsDiv>
      <div>
        {numberOfNodes !== 0 && hasNodePools && (
          <RefreshableLabel value={numberOfNodes}>
            <span>{cluster.nodePools.length} node pools, </span>
          </RefreshableLabel>
        )}
        <RefreshableLabel value={numberOfNodes}>
          <span>
            {numberOfNodes} {numberOfNodes === 1 ? 'node' : 'nodes'}
          </span>
        </RefreshableLabel>
        {numberOfNodes !== 0 && hasNodePools && (
          <>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel value={cores}>
              <span>{cores ? cores : '0'} CPU cores</span>
            </RefreshableLabel>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel value={memory}>
              <span>{memory ? memory : '0'} GB RAM</span>
            </RefreshableLabel>
          </>
        )}
        {cluster.kvm && (
          <span>
            <Dot style={{ paddingLeft: 0 }} />
            <RefreshableLabel value={storage}>
              <span>{storage ? storage : '0'} GB storage</span>
            </RefreshableLabel>
          </span>
        )}
      </div>
    </ClusterDetailsDiv>
  );
}

ClusterDashboardResources.propTypes = {
  cluster: PropTypes.object,
  isNodePool: PropTypes.bool,
  nodePools: PropTypes.array,
  resources: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const resources = ownProps.isNodePool
    ? selectComputedResourcesV5(state, ownProps)
    : selectComputedResourcesV4(state, ownProps);

  return {
    resources,
  };
}

export default connect(mapStateToProps, undefined)(ClusterDashboardResources);
