import { Box, Keyboard } from 'grommet';
import ClusterStatus from 'Home/ClusterStatus';
import React, { FC } from 'react';
import styled from 'styled-components';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import TextInput from 'UI/Inputs/TextInput';

const Cluster = styled(Box)`
  :hover {
    background-color: ${(props) => props.theme.colors.shade4};
    cursor: pointer;
  }
  &.selected {
    background-color: ${(props) => props.theme.colors.shade4};
  }
  &.disabled {
    opacity: ${(props) => props.theme.disabledOpacity};

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

export enum ClusterPickerVariant {
  ID,
  Name,
}

interface IClusterPicker {
  clusters: IClusterPickerCluster[];
  onChangeQuery: (query: string) => void;
  onSelectCluster: (clusterId: string) => void;
  query: string;
  selectedClusterID: string | null;
  variant?: ClusterPickerVariant;
}

const ClusterPicker: FC<IClusterPicker> = (props) => {
  const onSelectCluster: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (e) => {
    if (e.currentTarget.dataset.clusterid) {
      props.onSelectCluster(e.currentTarget.dataset.clusterid);
    }
  };

  const handleSelect = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  return (
    <Box height={{ min: 'fit-content' }}>
      <TextInput
        icon={<i className='fa fa-search' />}
        onChange={(e) => props.onChangeQuery(e.target.value)}
        value={props.query}
      />
      <Keyboard onSpace={handleSelect}>
        <Box>
          {props.clusters.length === 0 && (
            <NoSearchResults>
              {props.query.trim() !== '' ? (
                <>
                  No clusters matched your search query: &quot;{props.query}
                  &quot; <br />
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
                direction='row'
                align='center'
                pad={{ vertical: 'small', horizontal: '15px' }}
                margin={{ bottom: 'xsmall' }}
                round='xxsmall'
                className={[
                  cluster.id === props.selectedClusterID ? 'selected' : '',
                  !cluster.isAvailable ? 'disabled' : '',
                ].join(' ')}
                data-clusterid={cluster.id}
                data-testid={cluster.id}
                key={cluster.id}
                onClick={cluster.isAvailable ? onSelectCluster : undefined}
              >
                <ClusterIDLabel
                  clusterID={cluster.id}
                  variant={
                    props.variant === ClusterPickerVariant.ID
                      ? ClusterIDLabelType.ID
                      : ClusterIDLabelType.Name
                  }
                />
                <ClusterTitle>{cluster.name}</ClusterTitle>
                <ClusterNotice>
                  <ClusterStatus clusterId={cluster.id} />
                </ClusterNotice>
                <Organisation>{cluster.owner}</Organisation>
              </Cluster>
            );
          })}
        </Box>
      </Keyboard>
    </Box>
  );
};

ClusterPicker.defaultProps = {
  variant: ClusterPickerVariant.ID,
};

export default ClusterPicker;
