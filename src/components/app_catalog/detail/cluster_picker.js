import * as theme from '../../../lib/theme';
import ClusterIDLabel from '../../shared/cluster_id_label';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const ClusterPickerWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: 400,
});

const Input = styled.input({
  backgroundColor: theme.COLORS.shade5,
  border: '1px solid ' + theme.COLORS.shade6,
  borderRadius: theme.BORDER_RADIUS,
  fontSize: 14,
  lineHeight: 'normal',
  padding: '8px 10px',
  width: '100%',
});

const InputWrapper = styled.div({
  alignItems: 'center',
  display: 'flex',
  marginBottom: 15,
});

const Icon = styled.i({
  color: theme.COLORS.white3,
  fontSize: 24,
  marginRight: 5,
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

const ClusterPicker = props => {
  const onSelectCluster = e => {
    if (props.onSelectCluster) {
      props.onSelectCluster(e.currentTarget.dataset.clusterid);
    }
  };

  return (
    <ClusterPickerWrapper>
      <InputWrapper>
        <Icon className='fa fa-search' />
        <Input type='text' />
      </InputWrapper>
      <ClusterList>
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
  onSelectCluster: PropTypes.func,
};

export default ClusterPicker;
