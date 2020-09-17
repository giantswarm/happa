import styled from '@emotion/styled';
import ClusterStatus from 'Home/ClusterStatus';
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import Input from 'UI/Inputs/Input';

const ClusterPickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
`;

const ClusterList = styled.div`
  overflow: auto;
`;

const Cluster = styled.div`
  align-items: center;
  border-radius: ${(props) => props.theme.border_radius};
  display: flex;
  padding: 10px 15px;
  :hover {
    background-color: ${(props) => props.theme.colors.shade4};
    cursor: pointer;
  }
  &.selected {
    background-color: ${(props) => props.theme.colors.shade4};
  }
  &.disabled {
    opacity: 0.5;

    &:hover {
      cursor: default;
      background-color: unset;
    }
  }
`;

const ClusterTitle = styled.div`
  color: ${(props) => props.theme.colors.white2};
  font-size: 16px;
  font-weight: 800;
  margin: 0px 15px;
`;

const ClusterNotice = styled.div`
  flex-grow: 1;
`;

const Organisation = styled.div`
  color: ${(props) => props.theme.colors.white2};
  font-size: 12px;
`;

const NoSearchResults = styled.div`
  font-size: 16px;
  text-align: center;
  margin-top: 50px;
`;

interface IClusterPickerCluster
  extends Pick<IBaseCluster, 'id' | 'name' | 'owner'> {
  isAvailable: boolean;
}

interface IClusterPicker {
  clusters: IClusterPickerCluster[];
  onChangeQuery: (query: string) => void;
  onSelectCluster: (clusterId: string) => void;
  query: string;
  selectedClusterID?: string;
}

const ClusterPicker: FC<IClusterPicker> = (props) => {
  const onSelectCluster: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (e) => {
    if (e.currentTarget.dataset.clusterid) {
      props.onSelectCluster(e.currentTarget.dataset.clusterid);
    }
  };

  return (
    <ClusterPickerWrapper>
      <Input icon='search' onChange={props.onChangeQuery} value={props.query} />
      <ClusterList>
        {props.clusters.length === 0 && (
          <NoSearchResults>
            {props.query.trim() !== '' ? (
              <>
                No clusters matched your search query: &quot;{props.query}&quot;{' '}
                <br />
                <small>
                  Perhaps you have no clusters that support app installation.
                </small>
              </>
            ) : (
              <>No clusters available for app installation.</>
            )}
          </NoSearchResults>
        )}

        {props.clusters.map((cluster) => {
          return (
            <Cluster
              className={[
                cluster.id === props.selectedClusterID ? 'selected' : '',
                !cluster.isAvailable ? 'disabled' : '',
              ].join(' ')}
              data-clusterid={cluster.id}
              key={cluster.id}
              onClick={cluster.isAvailable ? onSelectCluster : undefined}
            >
              <ClusterIDLabel clusterID={cluster.id} />
              <ClusterTitle>{cluster.name}</ClusterTitle>
              <ClusterNotice>
                <ClusterStatus clusterId={cluster.id} />
              </ClusterNotice>
              <Organisation>{cluster.owner}</Organisation>
            </Cluster>
          );
        })}
      </ClusterList>
    </ClusterPickerWrapper>
  );
};

ClusterPicker.propTypes = {
  clusters: PropTypes.array.isRequired,
  onChangeQuery: PropTypes.func.isRequired,
  onSelectCluster: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  selectedClusterID: PropTypes.string,
};

export default ClusterPicker;
