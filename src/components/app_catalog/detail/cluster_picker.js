import * as theme from '../../../lib/theme';
import ClusterIDLabel from '../../shared/cluster_id_label';
import Input from './input';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const ClusterPickerWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: 400,
});

const ClusterList = styled.div({
  flexGrow: 1,
  overflow: 'scroll',
});

const Cluster = styled.div({
  alignItems: 'center',
  borderRadius: theme.BORDER_RADIUS,
  display: 'flex',
  padding: '10px 15px',
  ':hover': {
    backgroundColor: theme.COLORS.shade4,
    cursor: 'pointer',
  },
  '&.selected': {
    backgroundColor: theme.COLORS.shade4,
  },
});

const ClusterTitle = styled.div({
  color: theme.COLORS.white2,
  flexGrow: 1,
  fontSize: 16,
  fontWeight: 800,
  margin: '0px 15px',
});

const Organisation = styled.div({
  color: theme.COLORS.white2,
  fontSize: 12,
});

const NoSearchResults = styled.div({
  fontSize: 16,
  textAlign: 'center',
  marginTop: 50,
});

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
            No clusters matched your search query: &quot;{props.query}&quot;
          </NoSearchResults>
        )}

        {props.clusters.map(cluster => {
          return (
            <Cluster
              onClick={onSelectCluster}
              data-clusterid={cluster.id}
              key={cluster.id}
              className={
                cluster.id === props.selectedClusterID ? 'selected' : ''
              }
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
