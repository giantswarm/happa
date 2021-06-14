import { Box } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import ClusterDetailWidgetKeyPairs from 'UI/Display/MAPI/keypairs/ClusterDetailWidgetKeyPairs';

import ClusterDetailWidgetApps from '../../apps/ClusterDetailWidgetApps';
import { IClusterItem } from '../types';
import ClusterDetailOverviewDelete from './ClusterDetailOverviewDelete';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';
import ClusterDetailWidgetKubernetesAPI from './ClusterDetailWidgetKubernetesAPI';
import ClusterDetailWidgetWorkerNodes from './ClusterDetailWidgetWorkerNodes';

const StyledBox = styled(Box)`
  gap: ${({ theme }) => theme.global.edgeSize.small};
`;

interface IClusterDetailOverviewProps extends IClusterItem {
  onDelete: () => Promise<void>;
  gettingStartedPath: string;
  workerNodesPath: string;
  appsPath: string;
  createKeyPairPath: string;
}

const ClusterDetailOverview: React.FC<IClusterDetailOverviewProps> = ({
  onDelete,
  gettingStartedPath,
  workerNodesPath,
  appsPath,
  name,
  creationDate,
  k8sApiURL,
  workerNodePoolsCount,
  workerNodesCount,
  workerNodesCPU,
  workerNodesMemory,
  appsCount,
  appsUniqueCount,
  appsDeployedCount,
  createKeyPairPath,
  activeKeyPairsCount,
}) => {
  const isLoading = typeof name === 'undefined';

  return (
    <StyledBox wrap={true} direction='row'>
      <ClusterDetailWidgetWorkerNodes
        workerNodesPath={workerNodesPath}
        workerNodePoolsCount={workerNodePoolsCount}
        workerNodesCount={workerNodesCount}
        workerNodesCPU={workerNodesCPU}
        workerNodesMemory={workerNodesMemory}
        basis='500px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetApps
        appsPath={appsPath}
        appsCount={appsCount}
        appsUniqueCount={appsUniqueCount}
        appsDeployedCount={appsDeployedCount}
        basis='350px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetKeyPairs
        createKeyPairPath={createKeyPairPath}
        activeKeyPairsCount={activeKeyPairsCount}
        basis='200px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetKubernetesAPI
        gettingStartedPath={gettingStartedPath}
        k8sApiURL={k8sApiURL}
        basis='100%'
      />
      <ClusterDetailWidgetCreated creationDate={creationDate} basis='100%' />
      {!isLoading && (
        <ClusterDetailOverviewDelete
          clusterName={name!}
          onDelete={onDelete}
          border='top'
          margin={{ top: 'small' }}
          basis='100%'
        />
      )}
    </StyledBox>
  );
};

ClusterDetailOverview.propTypes = {
  onDelete: PropTypes.func.isRequired,
  gettingStartedPath: PropTypes.string.isRequired,
  workerNodesPath: PropTypes.string.isRequired,
  appsPath: PropTypes.string.isRequired,
  createKeyPairPath: PropTypes.string.isRequired,
  name: PropTypes.string,
  creationDate: PropTypes.string,
  k8sApiURL: PropTypes.string,
  workerNodePoolsCount: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesMemory: PropTypes.number,
  appsCount: PropTypes.number,
  appsUniqueCount: PropTypes.number,
  appsDeployedCount: PropTypes.number,
  activeKeyPairsCount: PropTypes.number,
};

export default ClusterDetailOverview;
