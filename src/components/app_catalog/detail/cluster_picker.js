import { css } from '@emotion/core';
import ClusterIDLabel from 'UI/cluster_id_label';
import Input from './input';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const ClusterPickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
`;

const ClusterList = styled.div`
  flex-grow: 1px;
  overflow: auto;
`;

const themeBorderRadius = theme => css`
  border-radius: ${theme.border_radius};
`;

const themeBackgroundShade4 = theme => css`
  background-color: ${theme.colors.shade4};
`;

const themeColorWhite2 = theme => css`
  color: ${theme.colors.white2};
`;

const Cluster = styled.div`
  align-items: center;
  ${themeBorderRadius};
  display: flex;
  padding: 10px 15px;
  :hover {
    ${themeBackgroundShade4};
    cursor: pointer;
  }
  &.selected {
    ${themeBackgroundShade4};
  }
`;

const ClusterTitle = styled.div`
  ${themeColorWhite2};
  flex-grow: 1;
  font-size: 16px;
  font-weight: 800;
  margin: 0px 15px;
`;

const Organisation = styled.div`
  ${themeColorWhite2};
  font-size: 12px;
`;

const NoSearchResults = styled.div`
  font-size: 16px;
  text-align: center;
  margin-top: 50px;
`;

const ClusterPicker = props => {
  const onSelectCluster = e => {
    if (props.onSelectCluster) {
      props.onSelectCluster(e.currentTarget.dataset.clusterid);
    }
  };

  return (
    <ClusterPickerWrapper>
      <Input icon='search' onChange={props.onChangeQuery} value={props.query} />
      <ClusterList>
        {props.clusters.length === 0 && (
          <NoSearchResults>
            No clusters matched your search query: &quot;{props.query}&quot;{' '}
            <br />
            <small>
              Perhaps you have no clusters that support app installation.
            </small>
          </NoSearchResults>
        )}

        {props.clusters.map(cluster => {
          return (
            <Cluster
              className={
                cluster.id === props.selectedClusterID ? 'selected' : ''
              }
              data-clusterid={cluster.id}
              key={cluster.id}
              onClick={onSelectCluster}
            >
              <ClusterIDLabel clusterID={cluster.id} />
              <ClusterTitle>{cluster.name}</ClusterTitle>
              <Organisation>{cluster.owner}</Organisation>
            </Cluster>
          );
        })}
      </ClusterList>
    </ClusterPickerWrapper>
  );
};

ClusterPicker.propTypes = {
  clusters: PropTypes.array,
  selectedClusterID: PropTypes.string,
  query: PropTypes.string,
  onChangeQuery: PropTypes.func,
  onSelectCluster: PropTypes.func,
};

export default ClusterPicker;
